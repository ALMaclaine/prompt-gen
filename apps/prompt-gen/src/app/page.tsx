import React from 'react';
import Header from '../components/Header';
import PromptForm from '../components/PromptForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-4">Generate Your AI Prompt</h2>
        <PromptForm />
      </main>
    </div>
  );
}
