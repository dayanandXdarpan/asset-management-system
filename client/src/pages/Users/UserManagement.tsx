import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import { Pagination } from '../../components/UI/Pagination';
import { useAuth } from '../../context/AuthContext';
import { Shield, Trash2, Edit, Plus } from 'lucide-react';
import styles from './Users.module.css';
import toast from 'react-hot-toast';

interface UserData {
    id: number;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

export const UserManagement = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'VIEWER' });
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const loadUsers = async () => {
        try {
            const data = await api.get('/users');
            setUsers(data);
        } catch (e) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadUsers(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await api.put(`/users/${editingUser.id}`, { name: formData.name, role: formData.role });
                toast.success('User updated');
            } else {
                await api.post('/users', formData);
                toast.success('User created');
            }
            setShowModal(false);
            setEditingUser(null);
            setFormData({ name: '', email: '', password: '', role: 'VIEWER' });
            loadUsers();
        } catch (e) {
            toast.error('Operation failed');
        }
    };

    const handleEdit = (user: UserData) => {
        setEditingUser(user);
        setFormData({ name: user.name, email: user.email, password: '', role: user.role });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (id === currentUser?.id) {
            toast.error("Cannot delete your own account");
            return;
        }
        try {
            await api.delete(`/users/${id}`);
            toast.success('User deleted');
            loadUsers();
        } catch (e) {
            toast.error('Delete failed');
        }
    };

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case 'ADMIN': return styles.roleAdmin;
            case 'TECHNICIAN': return styles.roleTech;
            default: return styles.roleViewer;
        }
    };

    if (currentUser?.role !== 'ADMIN') {
        return (
            <div className={styles.accessDenied}>
                <Shield size={64} color="var(--accent-primary)" />
                <h2>Access Denied</h2>
                <p>You need administrator privileges to view this page.</p>
            </div>
        );
    }

    const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
    const paginatedUsers = users.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className="title-gradient">User Management</h1>
                <Button onClick={() => { setEditingUser(null); setFormData({ name: '', email: '', password: '', role: 'VIEWER' }); setShowModal(true); }}>
                    <Plus size={18} style={{ marginRight: 8 }} /> Add User
                </Button>
            </div>

            <Card>
                {loading ? (
                    <div className={styles.loading}>Loading users...</div>
                ) : (
                    <>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedUsers.map(u => (
                                    <tr key={u.id}>
                                        <td>
                                            <div className={styles.userCell}>
                                                <div className={styles.avatar}>{u.name.charAt(0).toUpperCase()}</div>
                                                <span>{u.name}</span>
                                                {u.id === currentUser?.id && <span className={styles.youBadge}>You</span>}
                                            </div>
                                        </td>
                                        <td>{u.email}</td>
                                        <td>
                                            <span className={`${styles.roleBadge} ${getRoleBadgeClass(u.role)}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div className={styles.actions}>
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(u)}>
                                                    <Edit size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(u.id)}
                                                    disabled={u.id === currentUser?.id}
                                                >
                                                    <Trash2 size={16} color="#ef4444" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                    </>
                )}
            </Card>


            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingUser ? 'Edit User' : 'Create User'}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                            className={styles.input}
                        />
                    </div>
                    {!editingUser && (
                        <>
                            <div className={styles.formGroup}>
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Password</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    minLength={6}
                                    className={styles.input}
                                />
                            </div>
                        </>
                    )}
                    <div className={styles.formGroup}>
                        <label>Role</label>
                        <select
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                            className={styles.select}
                        >
                            <option value="VIEWER">Viewer</option>
                            <option value="TECHNICIAN">Technician</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                    <div className={styles.formActions}>
                        <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit">{editingUser ? 'Update' : 'Create'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
