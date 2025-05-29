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
    const explanations = [];

    for (let i = 0; i < maxIter; i++) {
        const scope = {};
        vars.forEach((v, idx) => { scope[v] = x[idx]; });

        const gradVals = grad.map((g, idx) => evaluate(g, scope));
        const xNew = x.map((xi, i) => xi - alpha * gradVals[i]);
        const diff = Math.sqrt(xNew.reduce((sum, xi, i) => sum + (xi - x[i]) ** 2, 0));

        explanations.push(
            `Step ${i}: We start with x = [${x.join(', ')}]. ` +
            `Using Gradient Descent, we compute gradients ∇f = [${gradVals.map(v => v.toFixed(4)).join(', ')}], ` +
            `then update using x_new = x - α * ∇f = [${xNew.map(v => v.toFixed(4)).join(', ')}].`
        );

        if (diff < tol) {
            explanations.push(`✅ Converged at step ${i} with tolerance ${tol}.`);
            break;
        }

        x = xNew;
        trajectory.push([...x]);
    }

    return { method: "Gradient Descent", solution: x, trajectory, explanations };
}

export function newtonMethod(expr, vars, initVals, maxIter, tol) {
    let x = [...initVals];

    const grad = vars.map(v => derivative(expr, v));
    const hessian = vars.map(v1 =>
        vars.map(v2 => derivative(derivative(expr, v1), v2))
    );

    const trajectory = [x.slice()];
    const explanations = [];

    for (let i = 0; i < maxIter; i++) {
        const scope = Object.fromEntries(vars.map((v, i) => [v, x[i]]));

        const gradVals = grad.map(g => evaluate(g.toString(), scope));
        const hessVals = hessian.map(row =>
            row.map(h => evaluate(h.toString(), scope))
        );

        let delta;
        try {
            const A = math.matrix(hessVals);
            const b = math.matrix(gradVals);
            delta = math.multiply(math.inv(A), b)._data;
        } catch (e) {
            explanations.push(`⚠️ Matrix inversion failed at step ${i}.`);
            break;
        }

        const xNew = x.map((xi, j) => xi - delta[j]);
        const diff = Math.sqrt(xNew.reduce((sum, xi, j) => sum + (xi - x[j]) ** 2, 0));

        explanations.push(
            `Step ${i}: x = [${x.join(', ')}], ∇f = [${gradVals.map(v => v.toFixed(4)).join(', ')}], ` +
            `Hessian inverse × ∇f = Δ = [${delta.map(d => d.toFixed(4)).join(', ')}], ` +
            `x_new = x - Δ = [${xNew.map(v => v.toFixed(4)).join(', ')}].`
        );

        if (diff < tol) {
            explanations.push(`✅ Converged at step ${i} with tolerance ${tol}.`);
            break;
        }

        x = xNew;
        trajectory.push([...x]);
    }

    return { method: "Newton", solution: x, trajectory, explanations };
}

export function lagrangianMethod(expr, vars, constraintsExprs, initVals, alpha, maxIter, tol) {
    const lambdas = constraintsExprs.map((_, i) => `l${i}`);
    const allVars = [...vars, ...lambdas];
    const lagExpr = constraintsExprs.reduce(
        (acc, g, i) => `(${acc}) + (${lambdas[i]})*(${g})`, expr
    );

    const grad = allVars.map(v => derivative(lagExpr, v));
    let x = [...initVals, ...new Array(lambdas.length).fill(1.0)];

    const trajectory = [x.slice(0, vars.length)];
    const explanations = [];

    for (let i = 0; i < maxIter; i++) {
        const scope = Object.fromEntries(allVars.map((v, i) => [v, x[i]]));
        const gradVals = grad.map(g => evaluate(g.toString(), scope));
        const xNew = x.map((xi, j) => xi - alpha * gradVals[j]);
        const diff = Math.sqrt(xNew.reduce((sum, xi, j) => sum + (xi - x[j]) ** 2, 0));

        explanations.push(
            `Step ${i}: x = [${x.slice(0, vars.length).join(', ')}], λ = [${x.slice(vars.length).join(', ')}], ` +
            `∇L = [${gradVals.map(v => v.toFixed(4)).join(', ')}], ` +
            `x_new = x - α * ∇L = [${xNew.map(v => v.toFixed(4)).join(', ')}].`
        );

        if (diff < tol) {
            explanations.push(`✅ Converged at step ${i} with tolerance ${tol}.`);
            break;
        }

        x = xNew;
        trajectory.push(x.slice(0, vars.length));
    }

    return { method: "Lagrangian", solution: x.slice(0, vars.length), trajectory, explanations };
}

export function determineBestMethod(expr, vars, constraints) {
    if (constraints && constraints.length > 0) return "lagrangian";
    if (expr.includes("^2") && !expr.includes("^3") && !expr.includes("^4")) return "gradient";
    return "newton";
}

export function solveExpression(expr, vars, initVals, constraints, alpha, maxIter, tol, method) {
    if (method === "auto") method = determineBestMethod(expr, vars, constraints);
    if (method === "gradient") return gradientDescent(expr, vars, initVals, alpha, maxIter, tol);
    if (method === "newton") return newtonMethod(expr, vars, initVals, maxIter, tol);
    if (method === "lagrangian") return lagrangianMethod(expr, vars, constraints, initVals, alpha, maxIter, tol);
    throw new Error("Unknown method: " + method);
}
