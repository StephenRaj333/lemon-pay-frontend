
import { useState, useEffect} from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Modal from "@/_components/modal"

interface Task {
    _id: string;
    taskName: string;
    description: string;
    dueDate: string;
    createdAt: string;
}

import { Dayjs } from 'dayjs';

interface TaskFormValues {
    id?: string;
    taskName: string;
    description: string;
    date: Dayjs | null;
}

export default function Dashboard() {
    const [openModal, setOpenModal] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [openUserDropdown, setOpenUserDropdown] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTask, setCurrentTask] = useState<Task | null>(null);
    const [modalTitle, setModalTitle] = useState("Add Task");
    const [user, setUser] = useState<{email: string, id: string} | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const router = useRouter();

    // Get auth token
    const getAuthToken = () => {
        return localStorage.getItem('token') || sessionStorage.getItem('token');
    };

    // Get user data from storage
    const getUserData = () => {
        const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (userData) {
            try {
                return JSON.parse(userData);
            } catch (error) {
                console.error('Error parsing user data:', error);
                return null;
            }
        }
        return null;
    };  

    // Get user initials (first two letters from email)
    const getUserInitials = (email: string) => {
        if (!email) return 'US';
        const name = email.split('@')[0]; // Get part before @
        if (name.length >= 2) {
            return name.substring(0, 2).toUpperCase();
        } else if (name.length === 1) {
            return name.toUpperCase() + 'U';
        }
        return 'US';
    };

    // Check authentication
    useEffect(() => {
        const token = getAuthToken();
        const userData = getUserData();
        
        if (!token || !userData) {
            // Clear any remaining data and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            router.push('/login');
            return;
        }
        
        // Set user data
        setUser(userData);
        fetchTasks();
    }, []);

    // Check for session changes (when user manually clears storage)
    useEffect(() => {
        const checkSession = () => {
            const token = getAuthToken();
            const userData = getUserData();
            
            if (!token || !userData) {
                // Session has been cleared, redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user');
                router.push('/login');
            }
        };

        // Check session every 5 seconds
        const sessionCheckInterval = setInterval(checkSession, 5000);
        
        // Also check when window gains focus
        window.addEventListener('focus', checkSession);
        
        return () => {
            clearInterval(sessionCheckInterval);
            window.removeEventListener('focus', checkSession);
        };
    }, []);

    // Fetch all tasks
    const fetchTasks = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },  
            });

            if (response.status === 200) {
                setTasks(response.data.tasks);
            }
        } catch (error) {
            console.error('Fetch tasks error:', error);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');
                router.push('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    // Create new task
    const handleCreateTask = async (values: TaskFormValues) => {
        try {
            const token = getAuthToken();
            const dueDate = values.date ? 
                new Date(values.date.format('YYYY-MM-DD')).toISOString().split('T')[0] : 
                new Date().toISOString().split('T')[0];
            
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
                taskName: values.taskName,
                description: values.description,
                dueDate: dueDate,
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 201) {
                fetchTasks(); // Refresh tasks list
                setOpenModal(false);
            }
        } catch (error) {
            console.error('Create task error:', error);
            setOpenModal(false);    
        }
    };

    // Update existing task
    const handleUpdateTask = async (values: TaskFormValues) => {
        try {
            const token = getAuthToken();
            const dueDate = values.date ? 
                new Date(values.date.format('YYYY-MM-DD')).toISOString().split('T')[0] : 
                undefined;
                
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/tasks/update/`, {
                id: values.id,
                taskName: values.taskName,
                description: values.description,
                dueDate: dueDate,
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200) {
                fetchTasks(); // Refresh tasks list
                setOpenModal(false);
                setIsEditing(false);
                setCurrentTask(null);
            }
        } catch (error) {
            console.error('Update task error:', error);
        }
    };

    // Delete task
    const handleDeleteTask = async (taskId: string) => {
        try {
            const token = getAuthToken();
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/tasks/delete/`, {
                id: taskId,
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200) {
                fetchTasks(); // Refresh tasks list
            }
        } catch (error) {
            console.error('Delete task error:', error); 
        }
    };

    // Close dropdown when clicking outside of it
    useEffect(() => {
        const handleClickOutside = () => {
            setOpenDropdown(null);
            setOpenUserDropdown(false);
        };

        if (openDropdown !== null || openUserDropdown) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [openDropdown, openUserDropdown]); 

    const toggleDropdown = (taskIndex: number, event: React.MouseEvent) => {
        event.stopPropagation();
        setOpenDropdown(openDropdown === taskIndex ? null : taskIndex);
        setOpenUserDropdown(false); // Close user dropdown when task dropdown opens
    };

    const toggleUserDropdown = (event: React.MouseEvent) => {
        event.stopPropagation();
        setOpenUserDropdown(!openUserDropdown);
        setOpenDropdown(null); // Close task dropdown when user dropdown opens
    };

    const handleLogout = () => {
        // Clear all session data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        
        // Close dropdown
        setOpenUserDropdown(false);
        
        // Redirect to login
        router.push('/login');
    };

    const handleEdit = (task: Task) => {
        setCurrentTask(task);
        setIsEditing(true);
        setModalTitle("Update Task");
        setOpenModal(true);
        setOpenDropdown(null);
    };  

    const handleDelete = (task: Task) => {
        if (confirm('Are you sure you want to delete this task?')) {
            handleDeleteTask(task._id);
        }
        setOpenDropdown(null);
    };

    const handleAddTask = () => {
        setIsEditing(false);
        setCurrentTask(null);
        setModalTitle("Add Task");
        setOpenModal(true);
    };

    const handleModalClose = () => {
        setOpenModal(false);
        setIsEditing(false);
        setCurrentTask(null);
        setModalTitle("Add Task");
    };

    // Pagination logic
    const totalPages = Math.ceil(tasks.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentTasks = tasks.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setOpenDropdown(null); // Close any open dropdowns when changing pages
    };

    const handlePreviousPage = () => {  
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Generate page numbers array
    const getPageNumbers = () => {
        const pages = [];
        // Always show at least 2 pages
        const maxPages = Math.max(2, totalPages);
        for (let i = 1; i <= maxPages; i++) {
            pages.push(i);
        }
        return pages;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-[#1E3BA3] text-xl">Loading tasks...</div>
            </div>  
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gray-50 p-8 dashboard-container max-[768px]:max-w-[90%] max-[768px]:mx-auto max-[768px]:py-[50px] max-[768px]:px-[0]"> 
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8 max-[768px]:flex-col max-[768px]:gap-[24px]"> 
                        <h1 className="text-[36px] max-[768px]:text-[24px] max-[768px]:leading-[70%] leading-[2%] font-semibold text-[#1E3BA3]">Tasks Management</h1>
                        
                        <div className="flex items-center gap-4">
                            <button onClick={handleAddTask} className="bg-[#1E3BA3] hover:bg-[#1E3BA3]/90 text-white px-6 py-3 rounded-full flex items-center gap-2 transition-colors cursor-pointer max-[768px]:text-[10px] max-[768px]:max-w-[110px]">  
                                <svg className="w-5 h-5 max-[768px]:w-[10px] max-[768px]:h-[10px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Task  
                            </button>
                            
                            {/* Avatar Dropdown */}
                            <div className="relative">
                                <button 
                                    onClick={toggleUserDropdown}
                                    className="cursor-pointer flex items-center gap-2 bg-[#1E3BA3] text-white px-3 py-2 rounded-full hover:bg-[#1E3BA3]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E3BA3] focus:ring-offset-2"
                                >
                                    <div className="w-8 h-8 bg-[#1E3BA3] text-white rounded-full flex items-center justify-center font-semibold text-sm border-2 border-white">
                                        {user?.email ? getUserInitials(user.email) : 'US'}
                                    </div>
                                    <svg 
                                        className={`w-4 h-4 transition-transform duration-200 ${openUserDropdown ? 'rotate-180' : ''}`} 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>   
                                
                                {/* Dropdown Menu */}
                                {openUserDropdown && (
                                    <div className="absolute right-0 top-12 z-20 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[250px] py-2">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900">Signed in as</p>
                                            <p className="text-sm text-gray-700 truncate">{user?.email || 'user@example.com'}</p>
                                        </div>
                                        <div className="py-1">
                                            <button 
                                                onClick={handleLogout}
                                                className="w-full px-4 cursor-pointer py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Sign out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>  

                    {/* Table Container */}
                    <div className="bg-white rounded-lg">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 px-6 py-4 max-[768px]:hidden">
                            <div className="col-span-1 text-[20px] leading-[136%] font-medium text-[#1E3BA3]">No</div>
                            <div className="col-span-2 text-[20px] leading-[136%] font-medium text-[#1E3BA3]">Date & Time</div>
                            <div className="col-span-2 text-[20px] leading-[136%] font-medium text-[#1E3BA3]">Task</div>
                            <div className="col-span-6 text-[20px] leading-[136%] font-medium text-[#1E3BA3]">Description</div>
                            <div className="col-span-1 text-[20px] leading-[136%] font-medium text-[#1E3BA3]">Action</div>
                        </div>

                        {/* Table Body */}    
                        {currentTasks.map((task, index) => (  
                            <div key={task._id} className="grid grid-cols-12 align-items gap-4 px-6 py-6 border-t border-b border-gray-100 transition-colors task-list max-[768px]:grid-cols-1 max-[768px]:gap-2 max-[768px]:relative items-center">
                                <div className="list col-span-1 text-[16px] leading-[96%] font-medium max-[768px]:hidden">{startIndex + index + 1}</div>
                                
                                {/* Desktop order: Date, Task, Description */}
                                <div className="list col-span-2 text-[16px] leading-[96%] max-[768px]:hidden">
                                    {new Date(task.dueDate).toLocaleDateString()}
                                </div>
                                <div className="list col-span-2 text-[16px] leading-[96%] font-medium max-[768px]:hidden">{task.taskName}</div>
                                <div className="list col-span-6 text-[16px] leading-[96%] leading-relaxed max-[768px]:hidden">{task.description}</div>
                                
                                {/* Mobile order: Task, Description, Date */}
                                <div className="list hidden max-[768px]:block text-[16px] leading-[96%] font-medium mb-2">{task.taskName}</div>
                                <div className="list hidden max-[768px]:block text-[16px] leading-[96%] leading-relaxed mb-2">{task.description}</div>
                                <div className="list hidden max-[768px]:block text-[16px] leading-[96%] mb-2">
                                    {new Date(task.dueDate).toLocaleDateString()}
                                </div>
                                
                                <div className="list col-span-1 relative max-[768px]:flex max-[768px]:justify-end max-[768px]:absolute max-[768px]:top-[20px] max-[768px]:right-0"> 
                                    <button     
                                        onClick={(e) => toggleDropdown(index, e)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                        </svg>  
                                    </button>
                                    
                                    {/* Dropdown Menu */}
                                    {openDropdown === index && (
                                        <div className="absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[120px] py-2 z-10">
                                            <button 
                                                onClick={() => handleEdit(task)}
                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>  
                                                Edit    
                                            </button>   
                                            <button     
                                                onClick={() => handleDelete(task)}
                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>      
                                                Delete
                                            </button>   
                                        </div>
                                    )}
                                </div>
                            </div>  
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center items-center mt-8 gap-2">
                        {/* Previous Button */}
                        <button 
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className={`p-2 transition-colors ${
                                currentPage === 1 
                                    ? 'text-gray-300 cursor-not-allowed' 
                                    : 'text-gray-400 hover:text-gray-600 cursor-pointer'
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        
                        {/* Page Numbers */}    
                        {getPageNumbers().map(page => (   
                            <button 
                                key={page}
                                onClick={() => handlePageChange(page)}
                                disabled={page > 1 && tasks.length <= itemsPerPage}
                                className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                                    page === currentPage
                                        ? 'bg-blue-600 text-white'
                                        : page > 1 && tasks.length <= itemsPerPage
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-600 hover:bg-gray-100 cursor-pointer'
                                }`} 
                            >   
                                {page}
                            </button>
                        ))}
                        
                        {/* Next Button */}
                        <button 
                            onClick={handleNextPage}
                            disabled={tasks.length <= itemsPerPage || currentPage === totalPages}
                            className={`p-2 transition-colors ${
                                tasks.length <= itemsPerPage || currentPage === totalPages
                                    ? 'text-gray-300 cursor-not-allowed' 
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <Modal 
                title={modalTitle} 
                open={openModal} 
                onCancel={handleModalClose}
                onSave={handleCreateTask}
                onUpdate={handleUpdateTask}
                taskData={currentTask}
                isEditing={isEditing}   
            />  
        </>
    )
}   

