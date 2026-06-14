import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { Button } from './components/ui/button';
import AuthScreen from './AuthScreen';
import { initDb, saveScore, getScores } from './db';
import type { User, ScoreRow } from './db';
import closedChest from './assets/treasure_closed.png';
import treasureChest from './assets/treasure_opened.png';
import skeletonChest from './assets/treasure_opened_skeleton.png';
import chestOpenSound from './audios/chest_open.mp3';
import evilLaughSound from './audios/chest_open_with_evil_laugh.mp3';
import keyIcon from './assets/key.png';

interface Box {
  id: number;
  isOpen: boolean;
  hasTreasure: boolean;
}

type AppMode = 'loading' | 'auth' | 'game';

export default function App() {
  const [mode, setMode] = useState<AppMode>('loading');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [scoreHistory, setScoreHistory] = useState<ScoreRow[]>([]);

  const [boxes, setBoxes] = useState<Box[]>([]);
  const [score, setScore] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);

  useEffect(() => {
    initDb().then(() => setMode('auth'));
  }, []);

  useEffect(() => {
    if (!gameEnded || !currentUser) return;
    const result: 'win' | 'tie' | 'loss' = score > 0 ? 'win' : score === 0 ? 'tie' : 'loss';
    saveScore(currentUser.id, score, result);
    setScoreHistory(getScores(currentUser.id));
  }, [gameEnded]);

  const initializeGame = () => {
    const treasureBoxIndex = Math.floor(Math.random() * 3);
    setBoxes(
      Array.from({ length: 3 }, (_, index) => ({
        id: index,
        isOpen: false,
        hasTreasure: index === treasureBoxIndex,
      }))
    );
    setScore(0);
    setGameEnded(false);
  };

  const handleAuth = (user: User) => {
    setCurrentUser(user);
    setScoreHistory(getScores(user.id));
    setMode('game');
    initializeGame();
  };

  const handleGuest = () => {
    setCurrentUser(null);
    setScoreHistory([]);
    setMode('game');
    initializeGame();
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setMode('auth');
  };

  const openBox = (boxId: number) => {
    if (gameEnded) return;

    setBoxes(prevBoxes => {
      const updatedBoxes = prevBoxes.map(box => {
        if (box.id === boxId && !box.isOpen) {
          new Audio(box.hasTreasure ? chestOpenSound : evilLaughSound).play();
          const newScore = box.hasTreasure ? score + 100 : score - 50;
          setScore(newScore);
          return { ...box, isOpen: true };
        }
        return box;
      });

      const treasureFound = updatedBoxes.some(box => box.isOpen && box.hasTreasure);
      const allOpened = updatedBoxes.every(box => box.isOpen);
      if (treasureFound || allOpened) {
        setGameEnded(true);
      }

      return updatedBoxes;
    });
  };

  if (mode === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-600 size-10" />
      </div>
    );
  }

  if (mode === 'auth') {
    return <AuthScreen onAuth={handleAuth} onGuest={handleGuest} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center p-8">
      <div className="w-full flex justify-end mb-4 max-w-3xl">
        {currentUser ? (
          <div className="flex items-center gap-3">
            <span className="text-amber-800 text-sm">
              Playing as: <strong>{currentUser.username}</strong>
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-amber-600 text-sm">Playing as Guest</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign In
            </Button>
          </div>
        )}
      </div>

      <div className="text-center mb-8">
        <h1 className="text-4xl mb-4 text-amber-900">🏴‍☠️ Treasure Hunt Game 🏴‍☠️</h1>
        <p className="text-amber-800 mb-4">
          Click on the treasure chests to discover what's inside!
        </p>
        <p className="text-amber-700 text-sm">
          💰 Treasure: +$100 | 💀 Skeleton: -$50
        </p>
      </div>

      <div className="mb-8 flex items-center justify-center gap-4">
        <div className="text-2xl text-center p-4 bg-amber-200/80 backdrop-blur-sm rounded-lg shadow-lg border-2 border-amber-400">
          <span className="text-amber-900">Current Score: </span>
          <span className={`${score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${score}
          </span>
        </div>
        {gameEnded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className={`text-2xl font-bold p-4 rounded-lg shadow-lg border-2 ${
              score > 0
                ? 'bg-green-100 text-green-700 border-green-400'
                : score === 0
                ? 'bg-amber-100 text-amber-700 border-amber-400'
                : 'bg-red-100 text-red-700 border-red-400'
            }`}
          >
            {score > 0 ? 'Win' : score === 0 ? 'Tie' : 'Loss'}
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {boxes.map((box) => (
          <motion.div
            key={box.id}
            className="flex flex-col items-center"
            style={{ cursor: box.isOpen ? 'default' : `url(${keyIcon}), pointer` }}
            whileHover={{ scale: box.isOpen ? 1 : 1.05 }}
            whileTap={{ scale: box.isOpen ? 1 : 0.95 }}
            onClick={() => openBox(box.id)}
          >
            <motion.div
              initial={{ rotateY: 0 }}
              animate={{
                rotateY: box.isOpen ? 180 : 0,
                scale: box.isOpen ? 1.1 : 1
              }}
              transition={{
                duration: 0.6,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <img
                src={box.isOpen
                  ? (box.hasTreasure ? treasureChest : skeletonChest)
                  : closedChest
                }
                alt={box.isOpen
                  ? (box.hasTreasure ? "Treasure!" : "Skeleton!")
                  : "Treasure Chest"
                }
                className="w-48 h-48 object-contain drop-shadow-lg"
              />

              {box.isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                >
                  {box.hasTreasure ? (
                    <div className="text-2xl animate-bounce">✨💰✨</div>
                  ) : (
                    <div className="text-2xl animate-pulse">💀👻💀</div>
                  )}
                </motion.div>
              )}
            </motion.div>

            <div className="mt-4 text-center">
              {box.isOpen ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className={`text-lg p-2 rounded-lg ${
                    box.hasTreasure
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
                >
                  {box.hasTreasure ? '+$100' : '-$50'}
                </motion.div>
              ) : (
                <div className="text-amber-700 p-2">
                  Click to open!
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {gameEnded && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mb-4 p-6 bg-amber-200/80 backdrop-blur-sm rounded-xl shadow-lg border-2 border-amber-400">
            <h2 className="text-2xl mb-2 text-amber-900">Game Over!</h2>
            <p className="text-lg text-amber-800">
              Final Score: <span className={`${score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${score}
              </span>
            </p>
            <p className="text-sm text-amber-600 mt-2">
              {boxes.some(box => box.isOpen && box.hasTreasure)
                ? 'Treasure found! Well done, treasure hunter! 🎉'
                : 'No treasure found this time! Better luck next time! 💀'}
            </p>
          </div>

          <Button
            onClick={initializeGame}
            className="text-lg px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white"
          >
            Play Again
          </Button>

          {currentUser && scoreHistory.length > 0 && (
            <div className="mt-6 w-full max-w-md mx-auto">
              <h3 className="text-amber-900 text-lg font-medium mb-3 text-center">
                Your Score History
              </h3>
              <div className="space-y-2">
                {scoreHistory.map(row => (
                  <div
                    key={row.id}
                    className={`flex justify-between items-center p-3 rounded-lg border text-sm ${
                      row.result === 'win'
                        ? 'bg-green-100 border-green-300 text-green-800'
                        : row.result === 'loss'
                        ? 'bg-red-100 border-red-300 text-red-800'
                        : 'bg-amber-100 border-amber-300 text-amber-800'
                    }`}
                  >
                    <span className="font-medium capitalize">{row.result}</span>
                    <span>${row.score}</span>
                    <span className="text-xs opacity-70">
                      {new Date(row.played_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
