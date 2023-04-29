const users = [
    {
      id: 1,
      username: "admin@zales.com",
      phone_number: "12348",
    },
    {
      id: 2,
      username: "alex@zales.com",
      phone_number: "12345",
    },
  ];
  
  const getUsers = () => users;
  
  const getUserById = (id) => users.find((user) => user.id === id);
  
  const getUserByEmail = (email) => users.find((user) => user.email === email);
  
  const addUser = (user) => {
    user.id = users.length + 1;
    users.push(user);
  };
  
  module.exports = {
    getUsers,
    getUserByEmail,
    getUserById,
    addUser,
  };
  