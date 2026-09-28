import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

const EmotionLineChart = ({ data }) => {
  return (
    <LineChart width={700} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="captured_at" />
      <YAxis />
      <Tooltip />
      <Line
        type="monotone"
        dataKey="confidence"
        stroke="#4F46E5"
        strokeWidth={2}
      />
    </LineChart>
  );
};

export default EmotionLineChart;
