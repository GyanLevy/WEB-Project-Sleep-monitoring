import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * GameView Component
 * Integrates the stateless game.html via iframe with bidirectional communication
 */
export default function GameView() {
  const gameFrameRef = useRef(null);
  const navigate = useNavigate();
  const { token, completedDays, coins, streak, inventory } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Debug: Log user data on mount
  useEffect(() => {
    console.log('GameView user data:', {
      token,
      completedDays,
      coins,
      streak,
      inventory
    });
  }, [token, completedDays, coins, streak, inventory]);

  /**
   * Update coins in Firestore
   */
  const updateCoins = async (newCoins) => {
    if (!token || typeof newCoins !== 'number' || newCoins < 0) {
      console.error('Invalid coin update:', { token, newCoins });
      return;
    }

    try {
      const studentRef = doc(db, 'students', token);
      await updateDoc(studentRef, {
        coins: newCoins
      });
      console.log('Coins updated:', newCoins);
    } catch (err) {
      console.error('Failed to update coins:', err);
      setError('Failed to save coins. Please try again.');
    }
  };

  /**
   * Handle game exit - navigate back to completion screen
   */
  const handleGameExit = () => {
    navigate('/complete');
  };

  /**
   * Inject game data and bind callbacks when iframe loads
   */
  const handleIframeLoad = () => {
    try {
      const gameWindow = gameFrameRef.current?.contentWindow;
      
      if (!gameWindow) {
        console.error('Game iframe not available');
        setError('Failed to load game. Please refresh.');
        return;
      }

      // Inject game data with robust fallbacks
      gameWindow.GAME_DATA = {
        // Level Logic - use completedDays for unlocked levels
        currentLevel: (completedDays || 0) + 1,
        totalLevels: 10, // Match 10-day program
        
        // Economy Logic
        coins: coins || 0,
        streak: streak || 0,
        
        // Inventory Logic - separate skins and weapons arrays
        ownedSkins: inventory && inventory.length > 0 
          ? inventory.filter(id => id.startsWith('skin_'))
          : ['skin_default'],
        ownedWeapons: inventory && inventory.length > 0
          ? inventory.filter(id => id.startsWith('weapon_'))
          : ['weapon_blaster'],
        equippedSkinId: 'skin_default',
        equippedWeaponId: 'weapon_blaster'
      };

      console.log('✅ Injected GAME_DATA:', gameWindow.GAME_DATA);

      // Bind callbacks
      gameWindow.onCoinUpdate = (newCoins) => {
        console.log('Coin update received:', newCoins);
        updateCoins(newCoins);
      };

      gameWindow.onGameExit = () => {
        console.log('Game exit requested');
        handleGameExit();
      };

      // Call init if game provides it
      if (typeof gameWindow.initGame === 'function') {
        gameWindow.initGame();
        console.log('Called initGame()');
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing game:', err);
      setError('Failed to initialize game. Please try again.');
      setIsLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    const currentFrame = gameFrameRef.current;
    
    return () => {
      const gameWindow = currentFrame?.contentWindow;
      if (gameWindow) {
        gameWindow.onCoinUpdate = null;
        gameWindow.onGameExit = null;
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-white text-lg">Loading Game...</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {error}
        </div>
      )}

      {/* Game Iframe */}
      <iframe
        ref={gameFrameRef}
        src="/Game.html"
        onLoad={handleIframeLoad}
        className="w-full h-full border-0"
        title="SleepQuest Game"
        allow="fullscreen"
      />
    </div>
  );
}
