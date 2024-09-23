import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import 'tailwindcss/tailwind.css';
import ReactIcon from '../../assets/react.svg';
import NextIcon from '../../assets/nextdotjs.svg';
import VercelIcon from '../../assets/vercel.svg';
import ExpressIcon from '../../assets/express.svg';
import ElectronIcon from '../../assets/electron.svg';
import KotlinIcon from '../../assets/kotlin.svg';
import SpringIcon from '../../assets/spring.svg';
import DjangoIcon from '../../assets/django.svg';
import AWSIcon from '../../assets/amazonwebservices.svg';
import LinuxIcon from '../../assets/linux.svg';
import GitIcon from '../../assets/git.svg';
import DockerIcon from '../../assets/docker.svg';
import CSSIcon from '../../assets/css3.svg';
import MySQLIcon from '../../assets/mysql.svg';
import PostgreSQLIcon from '../../assets/postgresql.svg';
import PythonIcon from '../../assets/python.svg';
import NumpyIcon from '../../assets/numpy.svg';
import PandasIcon from '../../assets/pandas.svg';
import NodeIcon from '../../assets/nodedotjs.svg'
import AndroidIcon from '../../assets/android.svg'


function Home() {
  const items = [
    // JavaScript 관련
    { name: "React", icon: ReactIcon },
    { name: "Next", icon: NextIcon },
    { name: "Vercel", icon: VercelIcon },
    { name: "Express", icon: ExpressIcon },
    { name: "Node", icon: NodeIcon },
    
    // Java 관련
    { name: "Kotlin", icon: KotlinIcon },
    { name: "Spring", icon: SpringIcon },
  
    // OS 관련
    { name: "Linux", icon: LinuxIcon },
    { name: "Docker", icon: DockerIcon },
    
    // Utilities 관련
    { name: "CSS", icon: CSSIcon },
    { name: "AWS", icon: AWSIcon },
    { name: "Git", icon: GitIcon },
    { name: "Electron", icon: ElectronIcon },
    { name: "Android", icon: AndroidIcon },

    { name: "MySQL", icon: MySQLIcon },
    { name: "PostgreSQL", icon: PostgreSQLIcon },
    
    { name: "Django", icon: DjangoIcon },
    { name: "Python", icon: PythonIcon },
    { name: "Numpy", icon: NumpyIcon },
    { name: "Pandas", icon: PandasIcon },
  ];
  
  const categories = [
    { name: "JavaScript", bgColor: "bg-yellow-200" },
    { name: "Java", bgColor: "bg-green-200" },
    { name: "OS", bgColor: "bg-blue-200" },
    { name: "Utilities", bgColor: "bg-red-200" },
    { name: "Database", bgColor: "bg-gray-200" },
    { name: "Python", bgColor: "bg-white" }
  ];
  
  const getCategoryIndex = (index: number) => {
    if (index < 5) return 0; // JavaScript
    if (index < 7) return 1; // Server
    if (index < 9) return 2; // OS
    if (index < 14) return 3; // OS
    if (index < 16) return 4; // OS
    return 5; // Utilities
  };

  return (
    <div className='w-full h-full flex justify-center items-center p-4'>
      <div className='grid grid-cols-5 grid-rows-4 gap-4 w-full h-full border p-6'>
        {items.map((item, index) => {
          const categoryIndex = getCategoryIndex(index);
          return (
            <div
              key={index}
              className={`border p-4 ${categories[categoryIndex]?.bgColor || 'bg-gray-100'} flex justify-center items-center`}
            >
              <img src={item.icon} alt={item.name} className='w-12 h-12' />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}
