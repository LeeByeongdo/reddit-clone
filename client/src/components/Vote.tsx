import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { Comment } from '../types/subs';

interface VoteProps {
  vote: (value: number, comment?: Comment) => void;
  userVote?: number;
  voteScore?: number;
  comment?: Comment;
}

export default function Vote({
  vote,
  userVote,
  voteScore,
  comment,
}: VoteProps) {
  const handleVote = (value: number) => {
    if (comment) {
      vote(value, comment);
    } else {
      vote(value);
    }
  };

  return (
    <div className="flex-shrink-0 w-10 py-2 text-center rounded-l">
      <div
        className="flex justify-center w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-red-500"
        onClick={() => handleVote(1)}
      >
        {userVote === 1 ? (
          <FaArrowUp className="text-red-500" />
        ) : (
          <FaArrowUp />
        )}
      </div>
      <p className="text-xs font-bold">{voteScore}</p>
      <div
        className="flex justify-center w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-red-500"
        onClick={() => handleVote(-1)}
      >
        {userVote === -1 ? (
          <FaArrowDown className="text-blue-500" />
        ) : (
          <FaArrowDown />
        )}
      </div>
    </div>
  );
}
