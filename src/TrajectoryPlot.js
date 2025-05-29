import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function TrajectoryPlot({ trajectory }) {
    if (!trajectory || trajectory.length === 0 || trajectory[0].length < 2) {
        return <p style={{ marginTop: '1rem' }}>Graph requires at least two variables.</p>;
    }

    const data = trajectory.map((point, index) => ({
        step: index,
        x: point[0],
        y: point[1],
    }));

    return (
        <div style={{ marginTop: '2rem' }}>
            <h4>📊 Optimization Path (x vs y)</h4>
            <LineChart
                width={500}
                height={300}
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" type="number" domain={['auto', 'auto']} />
                <YAxis dataKey="y" type="number" domain={['auto', 'auto']} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="y" name="y vs x" stroke="#8884d8" dot={{ r: 3 }} />
            </LineChart>
        </div>
    );
}
