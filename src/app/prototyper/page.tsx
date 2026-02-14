'use client';

import { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { redirect } from 'next/navigation';

interface Cursor {
  id: string;
  username: string;
  x: number;
  y: number;
  color: string;
}

interface Path {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  userId: string;
  type: 'solid' | 'dotted';
}

export default function PrototyperPage() {
  const { user } = useAuth();
  const [showIntro, setShowIntro] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [cursors, setCursors] = useState<Cursor[]>([]);
  const [paths, setPaths] = useState<Path[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Path | null>(null);
  const [selectedTool, setSelectedTool] = useState<'cursor' | 'pen'>('cursor');
  const [showMinimap, setShowMinimap] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  if (!user) {
    return null; // Let ConditionalLayout handle the redirect
  }

  const initializeCanvas = () => {
    setShowIntro(false);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    setCursors(prev => [
      ...prev.filter(c => c.id !== user.id),
      { id: user.id, username: user.username, x, y, color: '#3b82f6' }
    ]);

    if (isDrawing && currentPath && selectedTool === 'pen') {
      setCurrentPath(prev => prev ? {
        ...prev,
        points: [...prev.points, { x, y }]
      } : null);
    }
  }, [pan, zoom, isDrawing, currentPath, selectedTool, user]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (selectedTool === 'pen') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;

      const newPath: Path = {
        id: Date.now().toString(),
        points: [{ x, y }],
        color: '#3b82f6',
        userId: user.id,
        type: 'solid'
      };

      setCurrentPath(newPath);
      setIsDrawing(true);
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && currentPath) {
      setPaths(prev => [...prev, currentPath]);
      setCurrentPath(null);
      setIsDrawing(false);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(3, prev * delta)));
  };

  const fitToScreen = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const pathToSVG = (path: Path) => {
    if (path.points.length < 2) return '';

    let d = `M ${path.points[0].x} ${path.points[0].y}`;
    for (let i = 1; i < path.points.length; i++) {
      const prev = path.points[i - 1];
      const curr = path.points[i];
      const cpx = (prev.x + curr.x) / 2;
      const cpy = (prev.y + curr.y) / 2;
      d += ` Q ${prev.x} ${prev.y} ${cpx} ${cpy}`;
    }

    return d;
  };

  if (showIntro) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-4">
            INTRODUCING PROTOTYPER™
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            The collaborative workspace where ideas come to life.
          </p>
          <button
            onClick={initializeCanvas}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
          >
            Try Prototyper today
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 overflow-hidden relative">
      <div
        ref={canvasRef}
        className="w-full h-full cursor-crosshair relative"
        style={{
          backgroundImage: `
            radial-gradient(circle, #374151 1px, transparent 1px),
            radial-gradient(circle, #374151 1px, transparent 1px)
          `,
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px, ${pan.x + 10 * zoom}px ${pan.y + 10 * zoom}px`
        }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        >
          {paths.map(path => (
            <path
              key={path.id}
              d={pathToSVG(path)}
              stroke={path.color}
              strokeWidth="2"
              fill="none"
              strokeDasharray={path.type === 'dotted' ? '5,5' : 'none'}
              markerEnd="url(#arrowhead)"
            />
          ))}
          {currentPath && (
            <path
              d={pathToSVG(currentPath)}
              stroke={currentPath.color}
              strokeWidth="2"
              fill="none"
            />
          )}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
            </marker>
          </defs>
        </svg>

        {cursors.map(cursor => (
          <div
            key={cursor.id}
            className="absolute pointer-events-none z-50"
            style={{
              left: cursor.x * zoom + pan.x,
              top: cursor.y * zoom + pan.y,
              transform: 'translate(-2px, -2px)'
            }}
          >
            <div className="flex items-center">
              <div
                className="w-4 h-4 rounded-full border-2 border-white"
                style={{ backgroundColor: cursor.color }}
              />
              <div className="ml-2 bg-black text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                {cursor.username}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-lg px-4 py-2 flex items-center gap-4 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm">Page 1</span>
          <button className="text-gray-400 hover:text-white">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="w-px h-6 bg-gray-600" />

        <div className="flex items-center gap-2">
          <button className="text-gray-400 hover:text-white p-1" title="Undo">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button className="text-gray-400 hover:text-white p-1" title="Redo">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
            </svg>
          </button>
          <button className="text-gray-400 hover:text-white p-1" title="Delete">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button className="text-gray-400 hover:text-white p-1" title="Comment">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
          <button className="text-gray-400 hover:text-white p-1" title="Share">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>
          <button className="text-gray-400 hover:text-white p-1" title="Duplicate">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button className="text-gray-400 hover:text-white p-1" title="More">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>

        <div className="w-px h-6 bg-gray-600" />

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(prev => Math.min(3, prev * 1.2))}
            className="text-gray-400 hover:text-white p-1"
            title="Zoom In"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>
          <span className="text-white text-sm min-w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(prev => Math.max(0.1, prev * 0.8))}
            className="text-gray-400 hover:text-white p-1"
            title="Zoom Out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
          <button
            onClick={fitToScreen}
            className="text-gray-400 hover:text-white p-1"
            title="Fit to Screen"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
          <button
            onClick={() => setShowMinimap(!showMinimap)}
            className={`p-1 ${showMinimap ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
            title="Toggle Minimap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 rounded-lg p-2 flex flex-col gap-2 shadow-lg">
        <button
          onClick={() => setSelectedTool('cursor')}
          className={`p-2 rounded ${selectedTool === 'cursor' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          title="Select"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
        </button>
        <button
          onClick={() => setSelectedTool('pen')}
          className={`p-2 rounded ${selectedTool === 'pen' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          title="Draw"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className="flex -space-x-2">
          {cursors.slice(0, 5).map(cursor => (
            <div
              key={cursor.id}
              className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold"
              style={{ backgroundColor: cursor.color }}
              title={cursor.username}
            >
              {cursor.username.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      {showMinimap && (
        <div className="absolute bottom-20 right-4 w-48 h-32 bg-gray-800 border border-gray-600 rounded-lg overflow-hidden">
          <div className="w-full h-full bg-gray-700 relative">
            <div className="text-white text-xs p-2">Minimap</div>
          </div>
        </div>
      )}
    </div>
  );
}