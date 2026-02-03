'use client';
import { Button } from '@repo/ui';

export default function Web() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Web</h1>
        <Button onClick={() => console.log('Pressed!')} text="Boop" />
      </div>
    </div>
  );
}
