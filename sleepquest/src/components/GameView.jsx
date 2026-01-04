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
  const [isGameLoading, setIsGameLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if user data is fully loaded from Firebase
  // This prevents the iframe from mounting before data is ready
  const isUserDataReady = token && 
    typeof coins === 'number' && 
    Array.isArray(inventory) && 
    typeof completedDays === 'number';

  // Debug: Log user data on mount
  useEffect(() => {
    console.log('GameView user data:', {
      token,
      completedDays,
      coins,
      streak,
      inventory,
      isUserDataReady
    });
  }, [token, completedDays, coins, streak, inventory, isUserDataReady]);

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

      // Construct the data object to push to the game
      const gameData = {
        // Level Logic - use completedDays for progress (not streak!)
        currentLevel: (completedDays || 0) + 1,
        totalLevels: 10, // Match 10-day program
        
        // Economy Logic
        coins: coins || 0,
        streak: streak || 0,
        
        // Inventory Logic - send flat array + separate arrays for compatibility
        ownedItems: inventory || ['skin_default', 'weapon_blaster'],
        ownedSkins: inventory && inventory.length > 0 
          ? inventory.filter(id => id.startsWith('skin_'))
          : ['skin_default'],
        ownedWeapons: inventory && inventory.length > 0
          ? inventory.filter(id => id.startsWith('weapon_'))
          : ['weapon_blaster'],
        equippedSkinId: 'skin_default',
        equippedWeaponId: 'weapon_blaster'
      };

      // 1. Inject as global property (Legacy support)
      gameWindow.GAME_DATA = gameData;
      console.log('✅ Injected GAME_DATA:', gameData);

      // 2. Call the active update function with retry mechanism
      const tryUpdateGame = (attempts = 0) => {
        if (typeof gameWindow.updateGameFromReact === 'function') {
          console.log('🔌 Calling updateGameFromReact with:', gameData);
          gameWindow.updateGameFromReact(gameData);
        } else {
          if (attempts < 3) {
            console.warn(`⚠️ updateGameFromReact not found yet, retrying... (${attempts + 1}/3)`);
            setTimeout(() => tryUpdateGame(attempts + 1), 500);
          } else {
            console.error('❌ Failed to update game: updateGameFromReact function not found in game.html');
          }
        }
      };

      // Trigger immediately
      tryUpdateGame();

      // Bind callbacks for game -> React communication
      gameWindow.onCoinUpdate = (newCoins) => {
        console.log('Coin update received:', newCoins);
        updateCoins(newCoins);
      };

      gameWindow.onGameExit = () => {
        console.log('Game exit requested');
        handleGameExit();
      };

      // Call init if game provides it (legacy)
      if (typeof gameWindow.initGame === 'function') {
        gameWindow.initGame();
        console.log('Called initGame()');
      }

      setIsGameLoading(false);
    } catch (err) {
      console.error('Error initializing game:', err);
      setError('Failed to initialize game. Please try again.');
      setIsGameLoading(false);
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
      {/* Loading Overlay - show while waiting for user data OR game iframe */}
      {(!isUserDataReady || isGameLoading) && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-white text-lg">
              {!isUserDataReady ? 'Loading Game Environment...' : 'Starting Game...'}
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {error}
        </div>
      )}

      {/* Game Iframe - ONLY mount when user data is ready */}
      {isUserDataReady && (
        <iframe
          ref={gameFrameRef}
          src="/game.html"
          onLoad={handleIframeLoad}
          className="w-full h-full border-0"
          title="SleepQuest Game"
          allow="fullscreen"
        />
      )}
    </div>
  );
}
