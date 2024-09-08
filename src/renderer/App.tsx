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


function Home() {
  const items = [
    // JavaScript 관련
    { name: "React", icon: ReactIcon },
    { name: "Next", icon: NextIcon },
    { name: "Vercel", icon: VercelIcon },
    { name: "Express", icon: ExpressIcon },
    { name: "Electron", icon: ElectronIcon },
    
    // Java 관련
    { name: "Kotlin", icon: KotlinIcon },
    { name: "Spring", icon: SpringIcon },
    { name: "Django", icon: DjangoIcon },
    { name: "AWS", icon: AWSIcon },
    
    // OS 관련
    { name: "Linux", icon: LinuxIcon },
    { name: "Git", icon: GitIcon },
    { name: "Docker", icon: DockerIcon },
    
    // Utilities 관련
    { name: "MySQL", icon: MySQLIcon },
    { name: "PostgreSQL", icon: PostgreSQLIcon },
    { name: "CSS", icon: CSSIcon },
  ];
  
  const categories = [
    { name: "JavaScript", bgColor: "bg-yellow-200" },
    { name: "Server", bgColor: "bg-blue-200" },
    { name: "OS", bgColor: "bg-green-200" },
    { name: "Utilities", bgColor: "bg-red-200" }
  ];
  
  const getCategoryIndex = (index: number) => {
    if (index < 5) return 0; // JavaScript
    if (index < 10) return 1; // Server
    if (index < 15) return 2; // OS
    return 3; // Utilities
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
