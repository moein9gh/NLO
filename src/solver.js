import { derivative, evaluate } from 'mathjs';
import nerdamer from 'nerdamer';
import * as math from 'mathjs';
import 'nerdamer/Solve';
import 'nerdamer/Calculus';
import 'nerdamer/Algebra';
import 'nerdamer/Extra';

export function parseLatexToExpression(latex) {
    try {
        const expr = nerdamer.convertFromLaTeX(latex).toString();
        return expr;
    } catch (e) {
        console.error("Failed to parse LaTeX:", e);
        return latex;
    }
}
export function gradientDescent(expr, vars, initVals, alpha, maxIter, tol) {
    let x = [...initVals];
    const grad = vars.map(v => derivative(expr, v).toString());

    const trajectory = [x.slice()];
    for (let i = 0; i < maxIter; i++) {
        const scope = {};
        vars.forEach((v, idx) => { scope[v] = x[idx]; });

        console.log(`\n🌀 Gradient Descent Iteration ${i}`);
        console.log("Scope:", scope);

        let gradVals;
        try {
            gradVals = grad.map((g, idx) => {
                const val = evaluate(g, scope);
                console.log(`∂f/∂${vars[idx]} = ${g} =`, val);
                return val;
            });
        } catch (e) {
            console.error("❌ Gradient evaluation failed:", e.message);
            break;
        }

        const xNew = x.map((xi, i) => xi - alpha * gradVals[i]);
        console.log("xNew:", xNew);

        const diff = Math.sqrt(xNew.reduce((sum, xi, i) => sum + (xi - x[i]) ** 2, 0));
        console.log("Step diff:", diff);

        if (diff < tol) {
            console.log("✅ Converged!");
            break;
        }

        x = xNew;
        trajectory.push([...x]);
    }

    return { method: "Gradient Descent", solution: x, trajectory };
}
export function newtonMethod(expr, vars, initVals, maxIter, tol) {
    let x = [...initVals];

    const grad = vars.map(v => derivative(expr, v));
    const hessian = vars.map(v1 =>
        vars.map(v2 => derivative(derivative(expr, v1), v2))
    );

    const trajectory = [x.slice()];

    for (let i = 0; i < maxIter; i++) {
        const scope = Object.fromEntries(vars.map((v, i) => [v, x[i]]));
        console.log(`\n🔍 Newton Iteration ${i}`);
        console.log("Scope:", scope);

        let gradVals, hessVals;
        try {
            gradVals = grad.map(g => {
                const val = math.evaluate(g.toString(), scope);
                if (typeof val !== 'number' || isNaN(val)) throw new Error(`Invalid grad value: ${val}`);
                return val;
            });
            console.log("Gradient Values:", gradVals);

            hessVals = hessian.map(row =>
                row.map(h => {
                    const val = math.evaluate(h.toString(), scope);
                    if (typeof val !== 'number' || isNaN(val)) throw new Error(`Invalid hessian value: ${val}`);
                    return val;
                })
            );
            console.log("Hessian Matrix:", hessVals);
        } catch (e) {
            console.error("❌ Evaluation error:", e.message);
            break;
        }

        let delta;
        try {
            const A = math.matrix(hessVals);
            const b = math.matrix(gradVals);
            delta = math.multiply(math.inv(A), b)._data;
            console.log("Delta:", delta);
        } catch (e) {
            console.error("❌ Matrix inversion or multiplication failed:", e.message);
            break;
        }

        if (!delta || delta.some(d => typeof d !== 'number' || isNaN(d))) {
            console.error("❌ Delta contains undefined or NaN values:", delta);
            break;
        }

        const xNew = x.map((xi, i) => xi - delta[i]);
        console.log("xNew:", xNew);

        const diff = Math.sqrt(xNew.reduce((sum, xi, i) => sum + (xi - x[i]) ** 2, 0));
        console.log("Step diff:", diff);

        if (diff < tol) {
            console.log("✅ Converged!");
            break;
        }

        x = xNew;
        trajectory.push([...x]);
    }

    return { method: "Newton", solution: x, trajectory };
}
export function lagrangianMethod(expr, vars, constraintsExprs, initVals, alpha, maxIter, tol) {
    const lambdas = constraintsExprs.map((_, i) => `l${i}`);
    const allVars = [...vars, ...lambdas];

    const lagExpr = constraintsExprs.reduce(
        (acc, g, i) => `(${acc}) + (${lambdas[i]})*(${g})`, expr
    );

    const grad = allVars.map(v => derivative(lagExpr, v));
    let x = [...initVals, ...new Array(lambdas.length).fill(1.0)];

    const trajectory = [x.slice()];
    for (let i = 0; i < maxIter; i++) {
        const scope = Object.fromEntries(allVars.map((v, i) => [v, x[i]]));
        console.log(`\n🧩 Lagrangian Iteration ${i}`);
        console.log("Scope:", scope);

        let gradVals;
        try {
            gradVals = grad.map((g, idx) => {
                const val = evaluate(g.toString(), scope);
                console.log(`∂L/∂${allVars[idx]} = ${g.toString()} =`, val);
                return val;
            });
        } catch (e) {
            console.error("❌ Gradient evaluation failed:", e.message);
            break;
        }

        const xNew = x.map((xi, i) => xi - alpha * gradVals[i]);
        console.log("xNew:", xNew);

        const diff = Math.sqrt(xNew.reduce((sum, xi, i) => sum + (xi - x[i]) ** 2, 0));
        console.log("Step diff:", diff);

        if (diff < tol) {
            console.log("✅ Converged!");
            break;
        }

        x = xNew;
        trajectory.push([...x]);
    }

    return {
        method: "Lagrangian",
        solution: x.slice(0, vars.length),
        trajectory: trajectory.map(t => t.slice(0, vars.length)),
    };
}

export function determineBestMethod(expr, vars, constraints) {
    if (constraints && constraints.length > 0) return "lagrangian";
    if (expr.includes("^2") && !expr.includes("^3") && !expr.includes("^4")) return "gradient";
    return "newton";
}

export function solveExpression(expr, vars, initVals, constraints, alpha, maxIter, tol, method) {
    if (method === "auto") method = determineBestMethod(expr, vars, constraints);
    console.log("METHOD",method)
    if (method === "gradient") return gradientDescent(expr, vars, initVals, alpha, maxIter, tol);
    if (method === "newton") return newtonMethod(expr, vars, initVals, maxIter, tol);
    if (method === "lagrangian") return lagrangianMethod(expr, vars, constraints, initVals, alpha, maxIter, tol);
    throw new Error("Unknown method: " + method);
}
