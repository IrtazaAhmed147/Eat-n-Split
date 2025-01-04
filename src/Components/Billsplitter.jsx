import React, { useEffect, useState } from 'react'

const Billsplitter = () => {

    const [form, setForm] = useState({ name: '', imageUrl: '' })
    const [billForm, setBillForm] = useState({ Bill: '', YourExpense: '', payer: '' })
    const [friends, setFriends] = useState([])
    const [isModal, setIsModal] = useState(false)
    const [name, setName] = useState('')
    const [box, setBox] = useState(false)
    const [friendPay, setFriendPay] = useState('')
    const [YouPay, setYouPay] = useState('')

    useEffect(() => {
        let friendList = localStorage.getItem('EatnSplitFriends')
        if (friendList) {
            setFriends(JSON.parse(friendList))
        }
    }, [])

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

        let user = friends.find((user) => user.name === name)
        if (payer === 'You') {

            if (user.YouOwe) {
                // ahzem owes me
                let owes = user.YouOwe - friendExpense;
                // 50 - 60
                // -10


                if (owes < 0) {
                    // Reverse relationship: i owes ahzem
                    user = { ...user, YouOwe: 0, owe: Math.abs(owes) };
                } else {
                    user = { ...user, YouOwe: owes };
                }

            } else {
                // me owes ahzem
                let owes = user.owe ? user.owe + friendExpense : friendExpense
                user = { ...user, owe: owes }

            }


            setYouPay(true)

        } else {

            if (user.owe) {

                // payer ahzem
                // me owes ahzem
                let owes = user.owe - YourExpense;
                // 60 - 80
                //-20
                if (owes < 0) {
                    // Reverse relationship: ahzem owe me
                    user = { ...user, owe: 0, YouOwe: Math.abs(owes) };
                } else {
                    user = { ...user, owe: owes };
                }

            } else {
                // ahzem owe me
                let owes = user.YouOwe ? user.YouOwe + YourExpense : YourExpense
                user = { ...user, YouOwe: owes }

            }



        }

        const updatedFriends = friends.map((friend) =>
            friend.name === name ? user : friend
        );
        localStorage.setItem('EatnSplitFriends', JSON.stringify(updatedFriends));

        setBox(false)
        setBillForm({ Bill: '', YourExpense: '', payer: '' })

    }


    const handleSelectedFriend = (name) => {
        setName(name)
        setBox(true)
    }

    return (
        <div className='flex gap-3'>
            <div style={{ marginLeft: '20%', width: '310px' }} className='flex flex-col' >
                <ul className='flex flex-col gap-3 '>
                    {friends?.map((friend) => {
                        return <li key={friend.id} className='flex gap-2 items-center justify-between w-full'>
                            <div className='flex gap-2 items-center'>

                                <img style={{ borderRadius: '100%', height: '30px' }} width='30px' src={friend.image} alt="friend" />
                                <div className='text-sm '>
                                    <p>{friend.name}</p>
                                    {!friend.owe && !friend.YouOwe ? <p>You and {friend.name} are evenly</p> : ''}
                                    {friend.owe ? <p className='text-green-700 '>You owe {friend.name} {friend.owe}$</p> : ''}
                                    {friend.YouOwe ? <p className='text-red-700'>{friend.name} owe You  {friend.YouOwe}$</p> : ''}

                                </div>
                            </div>
                            <button className='px-3 py-1 bg-orange-300 rounded-xl ms-3' onClick={() => handleSelectedFriend(friend.name)}>Select</button>
                        </li>
                    })}

                </ul>
                <button className='px-3 py-1 bg-orange-400 rounded-xl self-end mt-3' onClick={() => setIsModal(prev => !prev)}>{isModal ? 'Close' : 'Add Friend'}</button>

                {isModal && <div style={{ backgroundColor: '#ffd78d' }} className='p-2 flex flex-col mt-3 rounded-md'>
                    <div className='flex gap-1 items-center mb-2'>

                        <label htmlFor="name" className='flex items-center text-sm'>
                            <lord-icon
                                src="https://cdn.lordicon.com/hroklero.json"
                                trigger="hover"
                                style={{ width: '17px', height: '17px' }}>
                            </lord-icon>
                            Friend name</label>
                        <input value={form.name} name='name' onChange={handleChange} type="text" className='rounded-sm outline-none p-1 text-sm' />
                    </div>
                    <div className='flex gap-1 items-center'>
                        <label htmlFor="imageUrl" className='flex items-center text-sm'>
                            <lord-icon
                                src="https://cdn.lordicon.com/xtzwzauj.json"
                                trigger="hover"
                                colors="primary:#2ca58d,secondary:#4bb3fd,tertiary:#eee966,quaternary:#9ce5f4,quinary:#f9c9c0,senary:#ffc738"
                                style={{ width: '17px', height: '17px' }}>
                            </lord-icon>
                            Image URL</label>
                        <input value={form.imageUrl} name='imageUrl' onChange={handleChange} type="url" className='rounded-sm outline-none p-1 text-sm' />
                    </div>
                    <button className='px-20 py-1 bg-orange-400 rounded-xl self-end mt-3' onClick={handleAddFriend}>Add</button>
                </div>}



            </div>

            {box && <div className='bg-orange-100 flex flex-col p-3' style={{ width: '370px' }}>
                <h1>SPLIT A BILL WITH {name.toLocaleUpperCase()}</h1>
                <label htmlFor="Bill">Bill Value

                    <input value={billForm.Bill} name='Bill' onChange={handleBillForm} type="number" />
                </label>
                <label htmlFor="YourExpense">Your expense

                    <input value={billForm.YourExpense} name='YourExpense' onChange={handleBillForm} type="number" />
                </label>
                <label htmlFor={`${name}Expense`}>{name}'s expense

                    <input value={billForm[`${name}Expense`] || ''} name={`${name}Expense`} onChange={handleBillForm} type="number" />
                </label>
                <label htmlFor="payer">Who is paying the bill?

                    <select value={billForm.payer} name='payer' onChange={handleBillForm}>
                        <option value="You">You</option>
                        <option value={`${name}`}>{name}</option>
                    </select>
                </label>

                <button onClick={splitBill} className='px-20 py-1 bg-orange-400 rounded-xl self-end mt-3'>Split bill</button>
            </div>}
        </div>
    )
}

export default Billsplitter
