import 'plotly.js';

declare module 'plotly.js' {
    interface Scatter3DData {
        type: 'scatter3d';
        x: any[];
        y: any[];
        z: any[];
        mode?: 'lines' | 'markers' | 'lines+markers';
        marker?: Partial<{
        size: number;
        color: any[];
        colorscale: string;
        showscale: boolean;
        }>;
}

interface Data {
    type: 'scatter3d';
}
}