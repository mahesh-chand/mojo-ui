import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useSWR, { mutate } from 'swr'

const fetcher = async (url) => {
    try {
        const { data } = await axios.get(url)
        return data
    }
    catch (err) {
        return err
    }
}

const Homepage = () => {
    const { data: users } = useSWR(`http://localhost:8080/users`, fetcher, { refreshInterval: 3000 })
    const [formdata, setFormData] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [sortBy, setSortBy] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');
    const [searchTerm, setSearchTerm] = useState('');

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const onUserCreate = async () => {
        try {
            const newUser = {
                firstname: firstName,
                lastname: lastName,
                email: email,
                address: address
            };
            await axios.post('http://localhost:8080/users', newUser);

            setFirstName('');
            setLastName('');
            setEmail('');
            setAddress('');
            mutate('http://localhost:8080/users');
            closeModal();
        }
        catch (error) {
            console.error('Error', error);
            throw error;
        }
    }

    const onUserDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/users/${id}`);
            mutate('http://localhost:8080/users');
        }
        catch (err) {
            return err
        }
    }

    const onUserEdit = (user) => {
        setFormData(user)
        setFirstName(user.firstname);
        setLastName(user.lastname);
        setEmail(user.email);
        setAddress(user.address);
        openModal();
    }

    const onUserSave = async () => {
        try {
            await axios.put(`http://localhost:8080/users/${formdata._id}`, {
                firstname: firstName,
                lastname: lastName,
                email: email,
                address: address
            });
            setFormData(null);
            mutate('http://localhost:8080/users');
            closeModal();
        }
        catch (error) {
            console.error('Error', error);
            throw error;
        }
    }

    useEffect(() => {
        if (users) {
            const filteredData = users.filter(user =>
                (user.firstname && user.firstname.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (user.lastname && user.lastname.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (user.address && user.address.toLowerCase().includes(searchTerm.toLowerCase()))
            );

            if (sortBy) {
                filteredData.sort((a, b) => {
                    const fieldA = (a[sortBy] || '').toLowerCase();
                    const fieldB = (b[sortBy] || '').toLowerCase();
                    let comparison = 0;
                    if (fieldA > fieldB) {
                        comparison = 1;
                    } else if (fieldA < fieldB) {
                        comparison = -1;
                    }
                    return sortOrder === 'asc' ? comparison : -comparison;
                });
            }

            setFilteredUsers(filteredData);
        }
    }, [users, sortBy, sortOrder, searchTerm]);

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    return (
        <>
            <div className='p-5'>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    onClick={openModal}
                >Add User</button>
                <input
                    className="shadow mt-6 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="overflow-x-auto">
                <table className="table-auto w-full border-collapse border border-gray-800">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('firstname')}>First Name</th>
                            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('lastname')}>Last Name</th>
                            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('email')}>Email</th>
                            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('address')}>Address</th>
                            <th className="px-4 py-2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers && filteredUsers.map((user, index) => (
                            <tr key={index}>
                                <td className="border px-4 py-2">{user.firstname}</td>
                                <td className="border px-4 py-2">{user.lastname}</td>
                                <td className="border px-4 py-2">{user.email}</td>
                                <td className="border px-4 py-2">{user.address}</td>
                                <td className="border px-4 py-2">
                                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                        onClick={() => onUserEdit(user)}
                                    >Edit</button>
                                    <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                        onClick={() => onUserDelete(user._id)}
                                    >Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {!formdata ?
                isModalOpen && (
                    <div className="fixed z-10 inset-0 overflow-y-auto">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                            <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                                                Add User
                                            </h3>
                                            <div className="mt-2">
                                                <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                                                    <div className="mb-4">
                                                        <label className="block text-gray-700 text-sm font-bold mb-2">First Name</label>
                                                        <input
                                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                            type="text"
                                                            placeholder="First Name"
                                                            value={firstName}
                                                            onChange={(e) => setFirstName(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="mb-4">
                                                        <label className="block text-gray-700 text-sm font-bold mb-2">Last Name</label>
                                                        <input
                                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                            type="text"
                                                            placeholder="First Name"
                                                            value={lastName}
                                                            onChange={(e) => setLastName(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="mb-4">
                                                        <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                                                        <input
                                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                            type="text"
                                                            placeholder="First Name"
                                                            value={email}
                                                            onChange={(e) => setEmail(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="mb-4">
                                                        <label className="block text-gray-700 text-sm font-bold mb-2">Address</label>
                                                        <input
                                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                            type="text"
                                                            placeholder="First Name"
                                                            value={address}
                                                            onChange={(e) => setAddress(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <button
                                                            type="button"
                                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                                            onClick={onUserCreate}
                                                        >
                                                            Submit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                                            onClick={closeModal}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </form >
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : isModalOpen && (
                    <div className="fixed z-10 inset-0 overflow-y-auto">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                            <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                                                Add User
                                            </h3>
                                            <div className="mt-2"></div>
                                            <div className="max-w-md mx-auto mt-8">
                                                <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                                                    <div className="mb-4">
                                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                                            First Name
                                                        </label>
                                                        <input
                                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                            type="text"
                                                            placeholder="First Name"
                                                            value={firstName}
                                                            onChange={(e) => setFirstName(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="mb-4">
                                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                                            Last Name
                                                        </label>
                                                        <input
                                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                            type="text"
                                                            placeholder="Last Name"
                                                            value={lastName}
                                                            onChange={(e) => setLastName(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="mb-4">
                                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                                            Email
                                                        </label>
                                                        <input
                                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                            type="text"
                                                            placeholder="Email"
                                                            value={email}
                                                            onChange={(e) => setEmail(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="mb-4">
                                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                                            Address
                                                        </label>
                                                        <input
                                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                            type="text"
                                                            placeholder="Address"
                                                            value={address}
                                                            onChange={(e) => setAddress(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <button
                                                            type="button"
                                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                                            onClick={onUserSave}
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                                            onClick={closeModal}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    )
}

export default Homepage;