// Home.tsx 또는 App.tsx
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import 'tailwindcss/tailwind.css';
import { useEffect, useState } from 'react';
interface Project {
  avatar: string;               
  repoName: string;            
  commitMessage: string;        
  commitDate: string;           
  languages: {     
    [language: string]: string; 
  };
}


interface Projects {
  [key: string]: Project[]; // 여기서 key는 string으로, Projects는 Project 배열을 값으로 가집니다.
}

function Home() {
  const categories = [
    { name: 'web', color: 'bg-yellow-200' },
    { name: 'app', color: 'bg-green-200' },
    { name: 'game', color: 'bg-blue-200' },
    { name: 'tool', color: 'bg-red-200' },
  ];

  const [projects, setProjects] = useState<Projects>({
    web: [],
    app: [],
    game: [],
    tool: [],
  });
  

  const [newProject, setNewProject] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("web");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await window.electron.electronAPI.getAllRows('repo_card');
        if (error) {
          console.error('Error fetching data from Supabase:', error);
          return;
        }
  
        // 데이터를 카테고리별로 분류
        const categorizedProjects: Projects = {
          web: [],
          app: [],
          game: [],
          tool: [],
        };
  
        data.forEach((item: any) => {
          const project = {
            avatar: item.avatar,
            repoName: item.repo_name,
            commitMessage: item.last_commit,
            commitDate: item.last_commit_date,
            languages: item.languages ? JSON.parse(item.languages) : {}, // 언어 비율 정보 추가
          };
  
          if (categorizedProjects[item.category]) {
            categorizedProjects[item.category].push(project);
          }
        });
  
        // 최신순으로 정렬
        Object.keys(categorizedProjects).forEach((category) => {
          categorizedProjects[category] = categorizedProjects[category].sort(
            (a, b) => new Date(b.commitDate).getTime() - new Date(a.commitDate).getTime()
          );
        });
  
        // 상태 업데이트
        setProjects(categorizedProjects);

        console.log(categorizedProjects);
        
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally{
        setLoading(false); 
      }
    };
  
    fetchData();
  }, []);
  
  

  // GitHub API 호출하여 커밋 데이터 가져오기
  const fetchLastCommit = async (repoUrl: string) => {
    try {
      const repoName = repoUrl.replace('https://github.com/', '');
      const [owner, repo] = repoName.split('/');
  
      // 메인 프로세스에 마지막 커밋 정보 요청
      const commitInfo = await window.electron.ipcRenderer.invoke('fetch-github-commit', owner, repo);
  
      // 언어 비율 정보 요청
      const languages = await window.electron.ipcRenderer.invoke('fetch-github-languages', owner, repo);
  
      return { ...commitInfo, languages }; // 커밋 정보와 언어 비율 정보 반환
    } catch (error) {
      console.error('Error fetching last commit or languages:', error);
      return null;
    }
  };
  

  // 프로젝트 추가 및 커밋 정보 가져오기
  const handleAddProject = async (category: string) => {
    if (newProject.trim() !== '') {
      // 마지막 커밋 정보를 비동기적으로 가져옴
      const commitInfo = await fetchLastCommit(newProject);
      console.log(commitInfo.languages);
  
      if (commitInfo) {
        const repoName = newProject.split('/').pop() || '';
  
        // 언어 비율 계산
        const languages = commitInfo.languages;
        const total = Object.values(languages).reduce((acc: number, curr: number) => acc + curr, 0); // 전체 숫자 합산
        const languageRatios = Object.keys(languages).reduce((acc, lang) => {
          acc[lang] = ((languages[lang] / total) * 100).toFixed(2); // 비율 계산 및 소수점 두 자리로 포맷팅
          return acc;
        }, {} as { [key: string]: string });
  
        // 커밋 정보와 언어 비율 정보 저장
        window.electron.electronAPI
          .insertRow('repo_card', {
            avatar: commitInfo.avatar,
            last_commit: commitInfo.commitMessage,
            last_commit_date: commitInfo.commitDate,
            repo_name: repoName,
            category: activeCategory,
            languages: JSON.stringify(languageRatios), // 언어 비율 정보를 JSON 문자열로 저장
          })
          .then((response) => {
            if (response.success) {
              window.electron.electronAPI.insertRow(activeCategory, {
                repo_card: response.data[0].id,
              });
            } else {
              console.error(response.error);
            }
          });
  
        setProjects((prevProjects) => {
          const updatedProjects = {
            ...prevProjects,
            [category]: [
              ...prevProjects[category] || [], // 이전 프로젝트가 없을 경우 빈 배열로 초기화
              { ...commitInfo, name: newProject },
            ],
          };
  
          // 최신순으로 정렬
          updatedProjects[category] = updatedProjects[category].sort(
            (a, b) => new Date(b.commitDate).getTime() - new Date(a.commitDate).getTime()
          );
  
          return updatedProjects;
        });
        setNewProject(''); // 입력창 초기화
      } else {
        console.error('Failed to fetch commit info for:', newProject);
        // 사용자에게 오류 메시지 표시 또는 알림 구현 (필요시)
      }
    } else {
      console.warn('New project input is empty.');
      // 사용자에게 입력값이 비어있음을 알림 (필요시)
    }
  };
  
  const SkeletonLoader = () => (
    <div className="flex flex-col space-y-4">
      {[...Array(3)].map((_, idx) => (
        <div key={idx} className="card w-full bg-gray-300 animate-pulse mb-2">
          <div className="card-body">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gray-400"></div>
              <div className="flex flex-col w-full">
                <div className="h-4 bg-gray-400 rounded mb-2"></div>
                <div className="h-3 bg-gray-400 rounded mb-1"></div>
                <div className="h-3 bg-gray-400 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
  
  

  return (
    <div className="w-full h-full flex flex-col items-center p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Side Project Management</h1>
  
      {/* 입력 필드와 버튼을 항상 보이게 하는 영역 */}
      <div className="mt-4 mb-6 p-4 w-full bg-white rounded-lg shadow-md h-1/5">
        <h2 className="text-lg font-semibold mb-4">
          Add a new project to {activeCategory}
        </h2>
        <div className="flex space-x-4">
          <input
            type="text"
            className="w-full p-2 border rounded-md"
            value={newProject}
            onChange={(e) => setNewProject(e.target.value)}
            placeholder="Enter project GitHub URL"
          />
          <button
            className="p-2 bg-blue-500 text-white rounded-md"
            onClick={() => handleAddProject(activeCategory)}
          >
            Add Project
          </button>
        </div>
      </div>
  
      <div className="flex gap-4 w-full h-3/4">
        {categories.map((category, index) => (
          <div
            key={index}
            className={`p-6 ${category.color} rounded-lg shadow-md cursor-pointer flex flex-col h-full w-1/4`}
            onClick={() => setActiveCategory(category.name)}
          >
            <h2 className="text-xl font-semibold">{category.name}</h2>
            <div className="mt-4 overflow-auto max-h-[calc(100% - 60px)] custom-scrollbar">
              {/* 스켈레톤을 렌더링할 상태 변수를 추가 */}
              {loading ? (
                // 로딩 스켈레톤
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-pulse bg-gray-300 rounded w-full h-4 mb-2" />
                  <div className="animate-pulse bg-gray-300 rounded w-full h-4 mb-2" />
                  <div className="animate-pulse bg-gray-300 rounded w-full h-4 mb-2" />
                </div>
              ) : (
                // 데이터가 존재할 때 실제 프로젝트 렌더링
                projects[category.name].map((project, idx) => {
                  // languages JSON 문자열을 객체로 변환
                  const languages = project.languages
  
                  return (
                    <div key={idx} className="card w-full bg-base-100 shadow-xl mb-2">
                      <div className="card-body">
                        <div className="flex items-center space-x-4">
                          <div className="avatar">
                            <div className="w-12 rounded-full">
                              <img src={project.avatar} alt="avatar" />
                            </div>
                          </div>
                          <div className="flex flex-col w-full">
                            <h2 className="card-title text-lg font-bold">{project.repoName}</h2>
                              <div className="mt-2">
                            </div>
  
                            {/* 커밋 날짜 표시 */}
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(project.commitDate).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
  
      {/* Custom Scrollbar CSS */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
  
  
  // 스켈레톤 로딩 컴포넌트
  
  
  
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
