import React from 'react';
import FlowingMenu from '../components/FlowingMenu'

const demoItems = [
  { link: 'http://localhost:3000/admindashboard', text: 'Admin Dashboard', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6xJYUPbIlFXmCBynLqRPf3GyEGxQj_jSxdA&s' },
  { link: '#', text: 'Mentors', image: 'https://picsum.photos/600/400?random=2' },
  { link: '#', text: 'Mentees', image: 'https://picsum.photos/600/400?random=3' },
  { link: '#', text: 'Analytics', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTw_vzCn3VTEWufT881ru-iGiuQQvFoOVtG-A&s' }
];

function AdminHome() {
  return (
    <div className="bg-black" style={{ height: '100vh', position: 'relative' }}>
      <FlowingMenu items={demoItems} />
    </div>
  );
}

export default AdminHome;
