import React, { useContext, useEffect, useState } from 'react';
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartOptions, } from "chart.js";
import "./chart-card.css";
import "./loading-container.css"
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

// Register required chart components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ChartDataEntry {
    city: string;
    month: string;
    windSpeeds: number[];
    // avgWindSpeed: number;
    so2s: number[];
    // avgSo2: number;
    pm2_5s: number[];
    // avgPm2_5: number;
    pm10s: number[];
    // avgPm10: number;
}

const Statistics : React.FC = () =>{
    const {username} = useContext(AuthContext);
    const [chartData, setChartData] = useState<ChartDataEntry[]>([]);
    const [chartLabels, setChartLabels] = useState<string[]>([]);
    const [datasets, setDatasets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const apiUrl = import.meta.env.VITE_API_URL;


    useEffect(() =>{
      const sendStatisticsRequest = async () =>{
        try {
          const response = await fetch(`${apiUrl}/mountPreviousNotifications`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'username': String(username),
            },
          });

          const payload = await response.json();
          const grouped:  {[key: string]: {[key: string]: { wind_speed: number[]; so2: number[]; pm10: number[]; pm2_5: number[] }} } = {};
                for(var p in payload){
                    console.log(payload[p])
                    const city_key = [];
                    for(var entry in payload[p]){
                        city_key.push(Object.keys(payload[p][entry]))
                        for(var city in payload[p][entry]){
                            
                          if(payload[p][entry][city].timestamp){
                                console.log("timestamp",payload[p][entry][city].timestamp);
                                console.log("notification", payload[p][entry][city].notification);
                                const date = new Date(payload[p][entry][city].timestamp);
                                const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // Format: YYYY-MM

                                const key = Object.keys(payload[p][entry])[0]; // Extract key once.

                                if (!grouped[key]) {
                                    grouped[key] = {};
                                }
                                if (!grouped[key][yearMonth]) {
                                    grouped[key][yearMonth] = { wind_speed: [], so2: [], pm10: [], pm2_5: [] };
                                }
                        
                                // Push the notification to the correct group
                                grouped[key][yearMonth].wind_speed.push(payload[p][entry][city].notification.wind_speed);
                                grouped[key][yearMonth].so2.push(payload[p][entry][city].notification.so2);
                                grouped[key][yearMonth].pm10.push(payload[p][entry][city].notification.pm10);
                                grouped[key][yearMonth].pm2_5.push(payload[p][entry][city].notification.pm2_5);
                            }
                        }
                    }
                    
                }
                console.log("grouped", grouped);
                
                const newChartData: ChartDataEntry[] = [];
                Object.keys(grouped).forEach((city) => {
                Object.keys(grouped[city]).forEach((month) => {
                const windSpeeds = grouped[city][month].wind_speed;
                const so2s = grouped[city][month].so2;
                const pm2_5s = grouped[city][month].pm2_5;
                const pm10s = grouped[city][month].pm10;

                newChartData.push({
                    city,
                    month,
                    windSpeeds,
                    so2s,
                    pm2_5s,
                    pm10s
                    });
                });
            });

          console.log("Processed Chart Data:", newChartData);
          setChartData(newChartData);
          setLoading(false);
        } catch (error) {
          console.error("Error while fetching statistics", error);
          setLoading(false);
        }
        
      }

      sendStatisticsRequest();
    }, []);
    

const cities = [...new Set(chartData.map((data) => data.city))];

let lastMonth = "";

  return (
    <div>
      {loading ? (
        <div className="loading-container">
          <span className="loader"></span>
        </div> 
    
    ):cities.map((city) => {
        const cityData = chartData.filter((data) => data.city === city);
        const labels = cityData.flatMap((data) =>
          data.windSpeeds.map((_, index) => `${data.month}-${index + 1}`) // Use unique timestamps per point
        );
        

        // Prepare chart datasets
        const datasets = [
          {
            label: " Wind Speed (km/h)",
            data: cityData.flatMap((data) => data.windSpeeds),
            borderColor: "rgba(75,192,192,1)",
            backgroundColor: "rgba(75,192,192,0.2)",
            tension: 0.4,
          },
          {
            label: " SO₂ (µg/m³)",
            data: cityData.flatMap((data) => data.so2s),
            borderColor: "rgba(255,99,132,1)",
            backgroundColor: "rgba(255,99,132,0.2)",
            tension: 0.4,
          },
          {
            label: " PM₁₀ (µg/m³)",
            data: cityData.flatMap((data) => data.pm10s),
            borderColor: "rgba(54,162,235,1)",
            backgroundColor: "rgba(54,162,235,0.2)",
            tension: 0.4,
          },
          {
            label: " PM₂.₅ (µg/m³)",
            data: cityData.flatMap((data) => data.pm2_5s),
            borderColor: "rgba(255,206,86,1)",
            backgroundColor: "rgba(255,206,86,0.2)",
            tension: 0.4,
          },
        ];

        const chartOptions: ChartOptions<"line"> ={
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: `${city}` },
          },
          scales: {
            x: {
              title: { display: true, text: "Time (Month)" },
              ticks: {
                
                callback: function (value: string | number, index: number, values: any[]) {
                  // Show only unique months on the X-axis
                  const dateLabel = labels[index];

                  const yearMonth = dateLabel.split("-").slice(0, 2).join("-");

                  if( index === 0 || yearMonth!== lastMonth){
                    lastMonth = yearMonth; // Update the last displayed month
                    return yearMonth; // Return the formatted year and month
                  }

                  return " ";
                },
              },
            },
            y: {
              title: { display: true, text: "Values" },
            },
          },
        };

        return (
          <div key={city} className='chart-card' >
            <div className="chart-content">
              <Line data={{ labels, datasets }} options={chartOptions} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Statistics;