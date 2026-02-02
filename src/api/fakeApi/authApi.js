const fakeUsers = [
    {
    id: 1,
    name: 'Citizen Demo',
    email: ' citizen@test.com',
    password: ' citizen123',
    role: 'Citizen',
  },
  {
    id: 2,
    name: 'Enterprise Demo',
    email: 'enterprise@test.com',
    password: 'enterprise123',
    role: 'Enterprise',
  },
  {
    id: 3,
    name: 'Collector Demo',
    email: 'collector@test.com',
    password: 'collector123',
    role: 'Collector',
  },
  {
    id: 4,
    name: 'Admin Demo',
    email: 'admin@test.com',
    password: 'admin123',
    role: 'Admin',
  },
]

function delay(ms = 800) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function Login(email, password) {
  await delay();
  const user = fakeUsers.find(
    (u) => u.email.toLocaleLowerCase() === email.toLocaleLowerCase() &&
     u.password === password
  ) 
  if (!user) {
    throw new Error('Invalid email or password');
  }
  return {
    token: 'demo-token',
    user,
  }
}


