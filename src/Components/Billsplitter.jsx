import React, { useEffect, useState } from 'react'

const Billsplitter = () => {

    const [form, setForm] = useState({ name: '', imageUrl: '' })
    const [billForm, setBillForm] = useState({ Bill: '', YourExpense: '', payer: '' })
    const [friends, setFriends] = useState([])
    const [isModal, setIsModal] = useState(false)
    const [name, setName] = useState('')
    const [id, setId] = useState('')
    const [box, setBox] = useState(false)

    useEffect(() => {
        let friendList = localStorage.getItem('EatnSplitFriends')
        if (friendList) {
            setFriends(JSON.parse(friendList))
        }
    }, [])

    useEffect(() => {
        const bill = parseInt(billForm.Bill) || 0;
        const yourExpense = parseInt(billForm.YourExpense) || 0;

        const friendExpense = bill - yourExpense;

        setBillForm((prev) => ({
            ...prev,
            [`${name}Expense`]: friendExpense > 0 ? friendExpense : 0,
        }));
    }, [billForm.Bill, billForm.YourExpense, name]);


    const handleAddFriend = () => {
        if (!form.name.trim() || !form.imageUrl.trim()) {
            return
        }
        const newFriend = {
            name: form.name,
            image: form.imageUrl,
            id: Date.now(),
        }
        setFriends([...friends, newFriend])
        localStorage.setItem('EatnSplitFriends', JSON.stringify([...friends, newFriend]))
        setIsModal(false)
        setForm({ name: '', imageUrl: '' })

    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }


    const handleBillForm = (e) => {
        setBillForm({ ...billForm, [e.target.name]: e.target.value })
    }


    const splitBill = () => {
        if (!billForm.Bill.trim() || !billForm.YourExpense.trim()) {
            return
        }

        let bill = parseInt(billForm.Bill)
        let YourExpense = parseInt(billForm.YourExpense)


        let friendExpense = parseInt(billForm[`${name}Expense`])
        let payer = billForm.payer ? billForm.payer : 'You'

        if (bill < YourExpense || bill < friendExpense) {
            return
        }
        if (YourExpense + friendExpense !== bill) {
            return
        }

        let user = friends.find((user) => user.id === id)
        if (payer === 'You') {

            if (user.owe) {
                let owes = user.owe - friendExpense;


                if (owes < 0) {
                    user = { ...user, YouOwe: Math.abs(owes), owe: 0 };
                } else {
                    user = { ...user, owe: owes };
                }

            } else {
                let owes = user.YouOwe ? user.YouOwe + friendExpense : friendExpense
                user = { ...user, YouOwe: owes }

            }


        } else {

            if (user.YouOwe) {
                let owes = user.YouOwe - YourExpense;
                if (owes < 0) {
                    user = { ...user, owe: Math.abs(owes), YouOwe: 0 };
                } else {
                    user = { ...user, YouOwe: owes };
                }

            } else {
                let owes = user.owe ? user.owe + YourExpense : YourExpense
                user = { ...user, owe: owes }

            }



        }

        const updatedFriends = friends.map((friend) =>
            friend.id === id ? user : friend
        );

        localStorage.setItem('EatnSplitFriends', JSON.stringify(updatedFriends));

        let friendList = localStorage.getItem('EatnSplitFriends')
        if (friendList) {
            setFriends(JSON.parse(friendList))
        }
        setId(null)
        setBox(false)
        setBillForm({ Bill: '', YourExpense: '', payer: '' })

    }


    const handleSelectedFriend = (name, id) => {
        setId(id)
        setName(name)
        setIsModal(false)
        setBox(true)
    }

    const handleRemoveUser = (id) => {
        setBox(false)
        const permission = window.confirm('do you want to remove this friend?')
        if (!permission) {
            return
        }
        const updatedList = friends.filter((friend) => {
            return friend.id !== id
        })
        localStorage.setItem('EatnSplitFriends', JSON.stringify(updatedList));
        let friendList = localStorage.getItem('EatnSplitFriends')
        if (friendList) {
            setFriends(JSON.parse(friendList))
        }

    }

    return (
        <div className='flex gap-3 flex-wrap w-11/12  mt-28'>
            <div style={{ width: '350px' }} className='flex flex-col' >
                <ul className='flex flex-col gap-3 '>
                    {friends.length === 0 && <p className='text-sm'>No Friends to Show</p>}
                    {friends?.map((friend) => {
                        return <li key={friend.id} style={{ backgroundColor: friend.id === id ? '#fff0d4' : '#fff' }} className='flex gap-2 items-center justify-between w-full p-2'>
                            <div className='flex gap-2 items-center'>

                                <img style={{ borderRadius: '100%', height: '35px', width: '35px' }} src={friend.image} alt="friend" />
                                <div className='text-sm '>
                                    <p className='font-medium'>{friend.name}</p>
                                    {!friend.owe && !friend.YouOwe ? <p>you and {friend.name} are even</p> : ''}
                                    {friend.owe ? <p className='text-red-700 '>you owe {friend.name} {friend.owe}$</p> : ''}
                                    {friend.YouOwe ? <p className='text-green-700'>{friend.name} owes you  {friend.YouOwe}$</p> : ''}

                                </div>
                            </div>
                            <div className='flex gap-1'>

                                <button className='px-3 py-1 bg-orange-300 rounded-xl ms-3 hover:bg-orange-400' onClick={() => {
                                    if (friend.id === id) {
                                        setId(null)
                                        setBox(false)
                                        return
                                    };
                                    handleSelectedFriend(friend.name, friend.id)
                                }}>{friend.id === id ? 'Close' : 'Select'}</button>
                                <button className='p-1 flex items-center' onClick={() => handleRemoveUser(friend.id)}>
                                    <lord-icon
                                        src="https://cdn.lordicon.com/skkahier.json"
                                        trigger="hover"
                                        colors="primary:#c74b16"
                                        style={{ width: '20px', height: '20px' }}>
                                    </lord-icon>
                                </button>
                            </div>
                        </li>
                    })}

                </ul>
                <button className='px-3 py-1 bg-orange-400 rounded-xl self-end mt-3 hover:bg-orange-500' onClick={() => {
                    setBox(false)
                    setIsModal(prev => !prev)
                }}>{isModal ? 'Close' : 'Add Friend'}</button>

                {isModal && <div style={{ backgroundColor: '#ffd78d' }} className='p-2 flex flex-col mt-3 rounded-md'>
                    <div className=' mb-2'>

                        <label htmlFor="name" className='flex items-center text-sm justify-between'>
                            <p className='flex items-center gap-0.5 text-sm'>

                                <lord-icon
                                    src="https://cdn.lordicon.com/hroklero.json"
                                    trigger="hover"
                                    style={{ width: '19px', height: '19px' }}>
                                </lord-icon>
                                Friend name
                            </p>
                            <input value={form.name} name='name' onChange={handleChange} type="text" className='rounded-sm outline-none p-1 text-sm' />
                        </label>
                    </div>
                    <div className=''>
                        <label htmlFor="imageUrl" className='flex items-center text-sm justify-between'>
                            <p className='flex items-center gap-0.5 text-sm'>

                                <lord-icon
                                    src="https://cdn.lordicon.com/xtzwzauj.json"
                                    trigger="hover"
                                    colors="primary:#2ca58d,secondary:#4bb3fd,tertiary:#eee966,quaternary:#9ce5f4,quinary:#f9c9c0,senary:#ffc738"
                                    style={{ width: '19px', height: '19px' }}>
                                </lord-icon>
                                Image URL
                            </p>
                            <input value={form.imageUrl} name='imageUrl' onChange={handleChange} type="url" className='rounded-sm outline-none p-1 text-sm' />
                        </label>
                    </div>
                    <button className='px-16 py-1 bg-orange-300 rounded-xl self-end mt-3' onClick={handleAddFriend}>Add</button>
                </div>}



            </div>

            {box && <div className='bg-orange-100 flex flex-col gap-2 p-3 w-[22rem]' style={{ minHeight: '280px', maxHeight: '300px' }}>
                <div className='flex justify-between' >

                    <h1 style={{ color: '#495057', fontWeight: 'bold' }}>SPLIT A BILL WITH {name.toLocaleUpperCase()}</h1>

                </div>
                <label className='flex justify-between' htmlFor="Bill">
                    <p className='flex items-center gap-0.5 text-sm'>
                        <lord-icon
                            src="https://cdn.lordicon.com/ymgusxed.json"
                            trigger="hover"
                            style={{ width: '19px', height: '19px' }}>
                        </lord-icon>
                        Bill Value
                    </p>

                    <input className='outline-none text-sm p-1 rounded-md' value={billForm.Bill} name='Bill' onChange={handleBillForm} type="number" />
                </label>
                <label className='flex justify-between' htmlFor="YourExpense">
                    <p className='flex items-center gap-0.5 text-sm'>
                        <lord-icon
                            src="https://cdn.lordicon.com/hroklero.json"
                            trigger="hover"
                            style={{ width: '19px', height: '19px' }}>
                        </lord-icon>
                        Your expense
                    </p>

                    <input className='outline-none text-sm p-1 rounded-md' value={billForm.YourExpense} name='YourExpense' onChange={handleBillForm} type="number" />
                </label>
                <label className='flex justify-between gap-2' htmlFor={`${name}Expense`}>
                    <p className='flex items-center gap-0.5 text-sm'>
                        <lord-icon
                            src="https://cdn.lordicon.com/zdwrqfmb.json"
                            trigger="hover"
                            style={{ width: '19px', height: '19px' }}>
                        </lord-icon>
                        {name}'s expense
                    </p>

                    <input readOnly={true} className='outline-none text-sm p-1 rounded-md' value={billForm[`${name}Expense`] || ''} name={`${name}Expense`} type="number" />
                </label>
                <label className='flex justify-between' htmlFor="payer">
                    <p className='flex items-center gap-0.5 text-sm'>
                        <lord-icon
                            src="https://cdn.lordicon.com/unsfxkxg.json"
                            trigger="hover"
                            style={{ width: '19px', height: '19px' }}>
                        </lord-icon>
                        Who is paying the bill?
                    </p>

                    <select className='p-1 px-4 rounded-md text-sm outline-none' value={billForm.payer} name='payer' onChange={handleBillForm}>
                        <option value="You">You</option>
                        <option value={`${name}`}>{name}</option>
                    </select>
                </label>

                <button onClick={splitBill} className='px-14 py-1 bg-orange-300 rounded-xl self-end mt-3'>Split bill</button>
            </div>}
        </div>
    )
}

export default Billsplitter
