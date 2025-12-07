'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Send } from 'lucide-react';
import Image from 'next/image';

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  text: string;
  timestamp: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const params = useParams();
  const recipientId = params.userId as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipient, setRecipient] = useState<{ username: string; profilePicture: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userId = localStorage.getItem('userId') || '';

  useEffect(() => {
    fetchMessages();
    fetchRecipient();
    // Poll for new messages
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [recipientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/messages/conversation/${recipientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchRecipient = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/${recipientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setRecipient({ username: data.username, profilePicture: data.profilePicture });
    } catch (error) {
      console.error('Error fetching recipient:', error);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId,
          text: newMessage,
        }),
      });

      if (response.ok) {
        const message = await response.json();
        setMessages(prev => [...prev, message]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-lg border-b border-primary/50 p-4 flex items-center gap-4 z-10">
        <button onClick={() => router.back()}>
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        {recipient && (
          <>
            {recipient.profilePicture ? (
              <Image
                src={recipient.profilePicture}
                alt={recipient.username}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-accent">
                {recipient.username[0].toUpperCase()}
              </div>
            )}
            <span className="font-semibold text-white">{recipient.username}</span>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {messages.map((message) => {
          const isUser = message.senderId === userId;
          return (
            <div
              key={message.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  isUser
                    ? 'bg-accent text-primary'
                    : 'bg-primary/30 text-white'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-primary/50 p-4">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-primary/30 border border-primary/50 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="bg-accent text-primary p-2 rounded-lg hover:bg-accent-dark transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
