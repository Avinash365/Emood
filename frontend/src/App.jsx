import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast'; // ✅ import the toaster
import './App.css';

function App() {
  return (
    <>
      <AppRoutes />
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default App;
