import './App.css';
import 'katex/dist/katex.min.css';
import 'mathlive/static.css';
import 'mathlive';
import {parseLatexToExpression, solveExpression} from './solver';
import {useEffect, useRef, useState} from 'react';
import {BlockMath} from 'react-katex';
import TrajectoryPlot from "./TrajectoryPlot";

const samples = [
    {
        name: '🎯 Gradient Descent: (x - 2)^2 + (y - 3)^2',
        latex: '(x - 2)^2 + (y - 3)^2',
        init: '0,0',
        constraints: ''
    },
    {
        name: '🌀 Newton: x^4 + y^4 - 4xy + x^2 + y^2',
        latex: 'x^4 + y^4 - 4xy + x^2 + y^2',
        init: '1,1',
        constraints: ''
    },
    {
        name: '📐 Lagrangian: x^2 + y^2 with x + y = 1',
        latex: 'x^2 + y^2',
        init: '0.5,0.5',
        constraints: 'x + y - 1'
    }
];

function App() {
    const mathfieldRef = useRef(null);
    const [latex, setLatex] = useState(samples[0].latex);
    const [method, setMethod] = useState('auto');
    const [initVals, setInitVals] = useState(samples[0].init);
    const [constraints, setConstraints] = useState(samples[0].constraints);
    const [alpha, setAlpha] = useState(0.1);
    const [maxIter, setMaxIter] = useState(100);
    const [tol, setTol] = useState(1e-6);
    const [result, setResult] = useState(null);
    const [showAllSteps, setShowAllSteps] = useState(false);
    const [showChart, setShowChart] = useState(false);
    const [activeStepIdx, setActiveStepIdx] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    const openStepDetails = (index) => {
        setActiveStepIdx(index);
        setShowDetails(true);
    };

    const closeStepDetails = () => {
        setActiveStepIdx(null);
        setShowDetails(false);
    };

    useEffect(() => {
        const mathfield = mathfieldRef.current;
        if (!mathfield) return;
        mathfield.value = latex;
        const handleInput = () => setLatex(mathfield.value);
        mathfield.addEventListener('input', handleInput);
        return () => mathfield.removeEventListener('input', handleInput);
    }, []);

    const inputStyle = {
        padding: '0.5rem',
        fontSize: '1rem',
        borderRadius: '6px',
        border: '1px solid #ccc',
        width: '100%',
        backgroundColor: '#fff',
        color: '#333446',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        outline: 'none'
    };

    const handleSampleChange = (e) => {
        const selected = samples.find(s => s.latex === e.target.value);
        if (selected) {
            setLatex(selected.latex);
            setInitVals(selected.init);
            setConstraints(selected.constraints);
            if (mathfieldRef.current) {
                mathfieldRef.current.value = selected.latex;
            }
        }
    };

    const handleSubmit = () => {
        const expr = parseLatexToExpression(latex).toString();
        const vars = Array.from(new Set(expr.match(/[a-zA-Z]+/g))).filter(v => !v.startsWith('l')).sort();
        const initial = initVals.split(',').map(Number);
        const constraintsList = constraints.split(',').map(c => c.trim()).filter(c => c);

        try {
            const result = solveExpression(expr, vars, initial, constraintsList, Number(alpha), Number(maxIter), Number(tol), method);
            setResult(result);
            setShowAllSteps(false);
        } catch (e) {
            alert("Error: " + e.message);
        }
    };

    return (
        <div className="App" style={{padding: '2rem', fontFamily: 'sans-serif', backgroundColor: '#EAEFEF'}}>
            <div style={{
                maxWidth: '850px',
                margin: '0 auto',
                background: '#fff',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <img src="/img.png" alt="App Logo" style={{ height: '160px' }} />
                </div>
                <h2 style={{textAlign: 'center', color: '#333446'}}>🧮 Math Optimizer</h2>

                <div style={{marginBottom: '1rem'}}>
                    <label>Select Sample:</label>
                    <select style={{...inputStyle, backgroundColor: '#B8CFCE'}} onChange={handleSampleChange}>
                        <option value="">-- Choose an example --</option>
                        {samples.map((s, i) => (
                            <option key={i} value={s.latex}>{s.name}</option>
                        ))}
                    </select>
                </div>

                <math-field ref={mathfieldRef}
                            style={{...inputStyle, fontSize: '1.5rem', marginBottom: '1rem'}}></math-field>

                <div style={{
                    background: '#f5f5f5',
                    color: '#333446',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '2rem'
                }}>
                    <p style={{margin: 0}}>Rendered Equation:</p>
                    <BlockMath math={latex}/>
                </div>

                {/* Grouped Inputs */}
                <h4 style={{marginTop: '2rem', color: '#333446'}}>⚙️ Problem Settings</h4>
                <div style={{display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr'}}>
                    <div>
                        <label>Method:</label>
                        <select value={method} onChange={(e) => setMethod(e.target.value)} style={inputStyle}>
                            <option value="auto">Auto</option>
                            <option value="gradient">Gradient Descent</option>
                            <option value="newton">Newton</option>
                            <option value="lagrangian">Lagrangian</option>
                        </select>
                    </div>
                    <div>
                        <label>Initial Values:</label>
                        <input value={initVals} onChange={(e) => setInitVals(e.target.value)} style={inputStyle}/>
                    </div>
                    <div>
                        <label>Constraints:</label>
                        <input value={constraints} onChange={(e) => setConstraints(e.target.value)} style={inputStyle}/>
                    </div>
                </div>

                <h4 style={{marginTop: '2rem', color: '#333446'}}>📈 Optimization Settings</h4>
                <div style={{display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr'}}>
                    <div>
                        <label>Alpha (α):</label>
                        <input type="number" step="0.01" value={alpha} onChange={(e) => setAlpha(e.target.value)}
                               style={inputStyle}/>
                    </div>
                    <div>
                        <label>Max Iterations:</label>
                        <input type="number" value={maxIter} onChange={(e) => setMaxIter(e.target.value)}
                               style={inputStyle}/>
                    </div>
                    <div>
                        <label>Tolerance:</label>
                        <input type="number" step="0.00001" value={tol} onChange={(e) => setTol(e.target.value)}
                               style={inputStyle}/>
                    </div>
                </div>

                <button onClick={handleSubmit} style={{
                    marginTop: '2rem',
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    borderRadius: '6px',
                    backgroundColor: '#333446',
                    color: 'white',
                    border: 'none'
                }}>Solve
                </button>

                {result && (
                    <div style={{marginTop: '3rem'}}>
                        <h3 style={{color: '#333446'}}>✅ Method: {result.method}</h3>
                        <p style={{color: '#7F8CAA'}}>📌 Solution: {JSON.stringify(result.solution)}</p>

                        <div style={{overflowX: 'auto'}}>
                            <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '1rem'}}>
                                <thead>
                                <tr style={{background: '#B8CFCE'}}>
                                    <th style={{padding: '8px', border: '1px solid #ccc'}}>Step</th>
                                    {result.solution.map((_, i) => (
                                        <th key={`header-${i}`}
                                            style={{padding: '8px', border: '1px solid #ccc'}}>{`x${i + 1}`}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {(showAllSteps ? result.trajectory : result.trajectory.slice(0, 10)).map((step, idx) => (
                                    <tr key={idx}>
                                        <td style={{padding: '8px', border: '1px solid #ccc'}}>
                                            {idx}
                                            <button onClick={() => openStepDetails(idx)} style={{
                                                marginLeft: '8px',
                                                padding: '2px 6px',
                                                fontSize: '0.8rem',
                                                borderRadius: '4px',
                                                background: '#7F8CAA',
                                                color: '#fff',
                                                border: 'none'
                                            }}>
                                                🔍
                                            </button>
                                        </td>
                                        {step.map((val, j) => (
                                            <td key={`cell-${idx}-${j}`}
                                                style={{padding: '8px', border: '1px solid #ccc'}}>
                                                {Number(val).toExponential(3)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                </tbody>

                            </table>
                            {result.trajectory.length > 10 && (
                                <button onClick={() => setShowAllSteps(prev => !prev)} style={{
                                    marginTop: '1rem',
                                    background: '#EAEFEF',
                                    padding: '0.5rem 1rem',
                                    border: '1px solid #ccc',
                                    borderRadius: '6px'
                                }}>
                                    {showAllSteps ? 'Show Less' : 'Show More'}
                                </button>
                            )}
                            {showDetails && activeStepIdx != null && (
                                <div style={{
                                    position: 'fixed',
                                    top: 0, left: 0,
                                    width: '100%', height: '100%',
                                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    zIndex: 1000
                                }}>
                                    <div style={{
                                        background: '#fff',
                                        padding: '2rem',
                                        borderRadius: '12px',
                                        width: '90%',
                                        maxWidth: '500px',
                                        color: '#333446',
                                        boxShadow: '0 2px 12px rgba(0,0,0,0.2)'
                                    }}>
                                        <h3>🧾 Step {activeStepIdx} Calculations</h3>
                                        <p>{result.explanations?.[activeStepIdx]}</p>
                                        <ul>
                                            {result.trajectory[activeStepIdx].map((val, idx) => (
                                                <li key={idx}>x{idx + 1} = {val}</li>
                                            ))}
                                        </ul>
                                        <button onClick={closeStepDetails} style={{ marginTop: '1rem', background: '#dc3545', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px' }}>
                                            Close
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>

                        <div style={{marginTop: '2rem', textAlign: 'center'}}>
                            <button onClick={() => setShowChart(true)} style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#28a745',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px'
                            }}>Show Trajectory Chart
                            </button>
                        </div>

                        {showChart && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                background: '#f9f9f9',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                textAlign: 'center',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                flexDirection: 'column'
                            }}>
                                <TrajectoryPlot trajectory={result.trajectory}/>
                                <button onClick={() => setShowChart(false)} style={{
                                    marginTop: '1rem',
                                    background: '#dc3545',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '6px'
                                }}>Close Chart
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
