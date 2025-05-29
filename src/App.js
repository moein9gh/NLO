import './App.css';
import 'katex/dist/katex.min.css';
import 'mathlive/static.css';
import 'mathlive';
import { parseLatexToExpression, solveExpression } from './solver';
import { useEffect, useRef, useState } from 'react';
import { BlockMath } from 'react-katex';

function App() {
    const mathfieldRef = useRef(null);
    const [latex, setLatex] = useState('(x - 2)^2 + (y - 3)^2');
    const [method, setMethod] = useState('auto');
    const [initVals, setInitVals] = useState('0,0');
    const [constraints, setConstraints] = useState('');
    const [alpha, setAlpha] = useState(0.1);
    const [maxIter, setMaxIter] = useState(100);
    const [tol, setTol] = useState(1e-6);
    const [result, setResult] = useState(null);

    useEffect(() => {
        const mathfield = mathfieldRef.current;
        if (!mathfield) return;

        mathfield.value = latex;
        const handleInput = () => setLatex(mathfield.value);
        mathfield.addEventListener('input', handleInput);
        return () => mathfield.removeEventListener('input', handleInput);
    }, []);

    const handleSubmit = () => {
        const expr = parseLatexToExpression(latex).toString();
        const vars = Array.from(new Set(expr.match(/\b[a-zA-Z]\b/g))).filter(v => !v.startsWith('l')).sort();
        const initial = initVals.split(',').map(Number);
        const constraintsList = constraints
            .split(',')
            .map(c => c.trim())
            .filter(c => c);

        try {

            const result = solveExpression(expr, vars, initial, constraintsList, Number(alpha), Number(maxIter), Number(tol), method);
            setResult(result);
        } catch (e) {
            alert("Error: " + e.message);
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <h2>🧮 Math Optimizer</h2>

                <math-field ref={mathfieldRef} style={{ background: 'white', color: 'black', fontSize: '1.5rem', padding: '0.5rem', borderRadius: '8px', width: '80%', maxWidth: '600px', marginBottom: '1rem' }}></math-field>

                <p>Rendered Equation:</p>
                <div style={{ background: '#fff', color: '#000', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', display: 'inline-block' }}>
                    <BlockMath math={latex} />
                </div>

                <div style={{ marginTop: '2rem', width: '80%', maxWidth: '600px' }}>
                    <label>Method: </label>
                    <select value={method} onChange={(e) => setMethod(e.target.value)}>
                        <option value="auto">Auto</option>
                        <option value="gradient">Gradient Descent</option>
                        <option value="newton">Newton</option>
                        <option value="lagrangian">Lagrangian</option>
                    </select>

                    <br /><label>Initial Values (comma-separated): </label>
                    <input value={initVals} onChange={(e) => setInitVals(e.target.value)} style={{ width: '100%' }} />

                    <br /><label>Constraints (comma-separated): </label>
                    <input value={constraints} onChange={(e) => setConstraints(e.target.value)} style={{ width: '100%' }} />

                    <br /><label>α (alpha): </label>
                    <input type="number" step="0.01" value={alpha} onChange={(e) => setAlpha(e.target.value)} />

                    <label>Max Iterations: </label>
                    <input type="number" value={maxIter} onChange={(e) => setMaxIter(e.target.value)} />

                    <label>Tolerance: </label>
                    <input type="number" step="0.00001" value={tol} onChange={(e) => setTol(e.target.value)} />

                    <br />
                    <button onClick={handleSubmit} style={{ marginTop: '1rem' }}>Solve</button>
                </div>

                {result && (
                    <div style={{ marginTop: '2rem' }}>
                        <h3>✅ Method: {result.method}</h3>
                        <p>📌 Solution: {JSON.stringify(result.solution)}</p>
                        <h4>📈 Trajectory</h4>
                        <pre style={{ textAlign: 'left' }}>
                            {result.trajectory.map((step, idx) => `Step ${idx}: ${step.join(', ')}`).join('\n')}
                        </pre>
                    </div>
                )}
            </header>
        </div>
    );
}

export default App;
