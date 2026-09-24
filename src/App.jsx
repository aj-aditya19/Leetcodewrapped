import { useState } from 'react';
import { useAnalytics } from './hooks/useAnalytics';
import { AnimatePresence } from 'framer-motion';
import Landing from './components/Landing';
import Loading from './components/Loading';
import Wrapped from './components/Wrapped';
import { fetchAllUserData } from './api/leetcode';
import { saveUserSearch } from './api/db';

// Accepts a bare username or a profile URL like https://leetcode.com/u/name/
function extractUsername(input) {
  const trimmed = input.trim().replace(/^@/, '');
  const match = trimmed.match(/leetcode\.(?:com|cn)\/(?:u\/)?([^/?#\s]+)/i);
  const username = match ? match[1] : trimmed.replace(/\/+$/, '');
  return /^[\w.-]+$/.test(username) ? username : '';
}

function App() {
  const [stage, setStage] = useState('landing'); // landing, loading, wrapped
  const [userData, setUserData] = useState(null);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const posthog = useAnalytics();

  const handleSubmit = async (rawInput) => {
    const inputUsername = extractUsername(rawInput);
    if (!inputUsername) {
      setError('Please enter a valid LeetCode username or profile URL');
      return;
    }
    setError('');
    setUsername(inputUsername);
    setStage('loading');

    try {
      const data = await fetchAllUserData(inputUsername);

      if (!data.profile || data.profile.errors) {
        throw new Error('User not found');
      }

      setUserData(data);
      saveUserSearch(inputUsername);
      posthog.identify(inputUsername);
      posthog.capture('user_search', { username: inputUsername });
      setStage('wrapped');
    } catch (err) {
      setError(err.message || 'Failed to fetch user data');
      setStage('landing');
    }
  };

  const handleRestart = () => {
    setStage('landing');
    setUserData(null);
    setUsername('');
    setError('');
  };

  return (
    <div className="app">
      <AnimatePresence mode="wait">
        {stage === 'landing' && (
          <Landing
            key="landing"
            onSubmit={handleSubmit}
            error={error}
          />
        )}
        {stage === 'loading' && (
          <Loading key="loading" username={username} />
        )}
        {stage === 'wrapped' && userData && (
          <Wrapped
            key="wrapped"
            data={userData}
            username={username}
            onRestart={handleRestart}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;