import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

const PlotClusterColors: React.FC = () => {
  const [plotData, setPlotData] = useState<Partial<Plotly.Data>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const getClusters = async () => {
      try {
        const response = await fetch(`${apiUrl}/clusters`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const clusters = await response.json();
        console.log('clusters:', clusters);

        // Define red, yellow, and green colors for clusters
        const clusterColors = ['red', 'yellow', 'green'];

        if (clusters.length !== 3) {
          console.error('Expected exactly 3 clusters but got:', clusters.length);
          return;
        }

        // Transform clusters into separate traces
        const traces: Partial<Plotly.Data>[] = clusters.map((cluster: any, index: number) => ({
          x: cluster.points.map((p: number[]) => p[0]), // X coordinates of points
          y: cluster.points.map((p: number[]) => p[1]), // Y coordinates of points
          z: cluster.points.map((p: number[]) => p[2]), // Z coordinates of points
          mode: 'markers',
          marker: {
            size: 4,
            color: clusterColors[index], // Assign red, yellow, or green based on cluster index
          },
          name: `Cluster ${index + 1}`, // Legend label
          type: 'scatter3d',
        }));

        setPlotData(traces);
      } catch (error) {
        console.error('Error fetching cluster data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getClusters();
  }, []);

  return (
    <div>
      <h1>3-Cluster Visualization (Red, Yellow, Green)</h1>
      {isLoading ? (
        <p>Loading clusters...</p>
      ) : (
        <Plot
          data={plotData}
          layout={{
            title: '3D Cluster Graph',
            scene: {
              xaxis: { title: 'X Axis' },
              yaxis: { title: 'Y Axis' },
              zaxis: { title: 'Z Axis' },
            },
            margin: { l: 0, r: 0, b: 0, t: 0 }, // Adjust margins
          }}
          style={{ width: '100%', height: '600px' }}
        />
      )}
    </div>
  );
};

export default PlotClusterColors;

