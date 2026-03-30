import { useState } from 'react';
import { 
  ThumbsUp, 
  Check, 
  BarChart3, 
  Users,
  Trophy,
  Sparkles
} from 'lucide-react';
import { Poll, UserVotes } from './types';
import { loadUserVotes, saveUserVotes } from './config';

interface PollCardProps {
  poll: Poll;
  onVote: (pollId: string) => void;
}

export default function PollCard({ poll, onVote }: PollCardProps) {
  const [userVotes, setUserVotes] = useState<UserVotes>(loadUserVotes());
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const hasVoted = userVotes[poll.id] === true;
  const isCompleted = poll.yesVotes >= poll.maxVotes;
  const percentage = Math.min(Math.round((poll.yesVotes / poll.maxVotes) * 100), 100);
  const remainingVotes = poll.maxVotes - poll.yesVotes;

  const handleVote = () => {
    if (hasVoted || isCompleted || !poll.active) return;

    setIsAnimating(true);
    
    const newVotes = { ...userVotes, [poll.id]: true };
    setUserVotes(newVotes);
    saveUserVotes(newVotes);

    onVote(poll.id);

    if (poll.yesVotes + 1 >= poll.maxVotes) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }

    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ${
      isCompleted 
        ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/30' 
        : 'bg-white/[0.02] border-white/10 hover:border-violet-500/30'
    }`}>
      {/* Confetti effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Completed badge */}
      {isCompleted && (
        <div className="absolute top-3 right-3 z-10">
          <div className="flex items-center gap-1.5 bg-emerald-500 rounded-full px-3 py-1 shadow-lg shadow-emerald-500/30">
            <Trophy className="w-3.5 h-3.5 text-white" />
            <span className="text-xs font-bold text-white">ZAKOŃCZONA</span>
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isCompleted 
              ? 'bg-emerald-500/20' 
              : 'bg-violet-500/20'
          }`}>
            <BarChart3 className={`w-6 h-6 ${isCompleted ? 'text-emerald-400' : 'text-violet-400'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg mb-1">{poll.question}</h3>
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {poll.yesVotes} / {poll.maxVotes} głosów
              </span>
              {!isCompleted && poll.active && (
                <span className="text-violet-400">
                  Zostało {remainingVotes} {remainingVotes === 1 ? 'głos' : remainingVotes < 5 ? 'głosy' : 'głosów'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Postęp</span>
            <span className={`text-sm font-bold ${isCompleted ? 'text-emerald-400' : 'text-violet-400'}`}>
              {percentage}%
            </span>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                isCompleted 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                  : 'bg-gradient-to-r from-violet-500 to-purple-500'
              }`}
              style={{ width: `${percentage}%` }}
            >
              <div className="w-full h-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>
        </div>

        {/* Vote button */}
        {!isCompleted && poll.active && (
          <button
            onClick={handleVote}
            disabled={hasVoted}
            className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              hasVoted
                ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white hover:scale-[1.02] active:scale-[0.98]'
            } ${isAnimating ? 'scale-95' : ''}`}
          >
            {hasVoted ? (
              <>
                <Check className="w-5 h-5" />
                Zagłosowano!
              </>
            ) : (
              <>
                <ThumbsUp className="w-5 h-5" />
                Tak, czekam!
              </>
            )}
          </button>
        )}

        {/* Completed message */}
        {isCompleted && (
          <div className="flex items-center justify-center gap-2 py-3.5 bg-emerald-500/10 rounded-xl text-emerald-400 font-medium">
            <Sparkles className="w-5 h-5" />
            Ankieta zakończona - dziękujemy za głosy!
          </div>
        )}
      </div>

      {/* Glow effect */}
      {!isCompleted && poll.active && !hasVoted && (
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
      )}
    </div>
  );
}
