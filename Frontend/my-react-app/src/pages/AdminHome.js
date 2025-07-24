import React from 'react';
import InfiniteMenu from '../components/InfiniteMenu';

const items = [
  {
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTe1j3pPEGlyG3FDluJOkeNd-hq3iGPnJiu4Q&s',
    link: 'https://google.com/',
    title: 'Item 1',
    description: 'Analytics'
  },
  {
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5Oo8N_azTayaqE7ZRD35WF2CDh9E8nP_B2Q&s',
    link: 'https://google.com/',
    title: 'Item 2',
    description: 'Mentors'
  },
  {
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQb8KJQxbLRli0l2JJCN4bhWU0glwOdGUOv1A&s',
    link: 'https://google.com/',
    title: 'Item 3',
    description: 'Mentees'
  },
  {
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTP8BjSsGYnOeIFaSgjqS04Uv76aH5Kx7aklQ&s',
    link: 'http://localhost:3000/admindashboard',
    title: 'Item 4',
    description: 'admin dashboard'
  }
];

function AdminHome() {
  return (
    <div style={{ height: 'full', position: 'relative' }}>
      <InfiniteMenu items={items} />
    </div>
  );
}

export default AdminHome;
