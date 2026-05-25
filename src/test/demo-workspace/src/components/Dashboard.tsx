import { useState } from 'react';
import { Card } from './Card';
import { Header } from './Header';
import name from '../../assets/logo.png';

export function Dashboard() {
  const [ isLoading, setIsLoading ] = useState(false);

  return (
    <div className="dashboard">
      <Header title="Dashboard" />
      <main>
        <Card title="Recent activity" />
        <Card title="Quick actions" />
      </main>
    </div>
  );
}
