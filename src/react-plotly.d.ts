declare module 'react-plotly.js' {
    import * as Plotly from 'plotly.js';

    interface PlotParams {
        data: Plotly.Data[];
        layout?: Partial<Plotly.Layout>;
        config?: Partial<Plotly.Config>;
        onInitialized?: (figure: Readonly<Plotly.Figure>, graphDiv: HTMLElement) => void;
        onUpdate?: (figure: Readonly<Plotly.Figure>, graphDiv: HTMLElement) => void;
        onPurge?: (graphDiv: HTMLElement) => void;
        className?: string;
        style?: React.CSSProperties;
        useResizeHandler?: boolean;
        debug?: boolean;
        divId?: string;
    }

    const Plot: React.FC<PlotParams>;
    export default Plot;
}


