import React, { useState } from 'react';
import { Star, RotateCcw } from 'lucide-react';

const Flashcard = ({ flashcard, onToggleStar }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    // gradient themes
    const gradients = [
        'linear-gradient(135deg, #8A9A3A, #5F6E24)', // olive
        'linear-gradient(135deg, #C76F6F, #9F4C4C)', // dusty rose
        'linear-gradient(135deg, #E6A800, #B88600)', // yellow
        'linear-gradient(135deg, #2563EB, #1D4ED8)', // blue
        'linear-gradient(135deg, #7C3AED, #5B21B6)', // purple
        'linear-gradient(135deg, #EA580C, #C2410C)', // orange
        'linear-gradient(135deg, #0891B2, #0E7490)', // cyan
        'linear-gradient(135deg, #16A34A, #166534)', // green
        'linear-gradient(135deg, #DB2777, #BE185D)', // pink
        'linear-gradient(135deg, #7C5A3A, #5A3F28)', // coffee
    ];

    // base colors for front border/shadow
    const baseColors = [
        '#B7C27A', // lighter olive (from #A3B635)
        '#E8B4B4', // lighter dusty rose (from #EF4444)
        '#FFD95A', // lighter yellow (from #FFC50F)
        '#60A5FA', // lighter blue (from #3B82F6)
        '#A78BFA', // lighter purple (from #8B5CF6)
        '#FB923C', // lighter orange (from #F97316)
        '#22D3EE', // lighter cyan (from #06B6D4)
        '#4ADE80', // lighter green (from #22C55E)
        '#F472B6', // lighter pink (from #EC4899)
        '#B08968', // lighter coffee (from #C2410C)
    ];

    const colorIndex =
        Math.abs(
            flashcard._id
                .split('')
                .reduce((acc, char) => acc + char.charCodeAt(0), 0)
        ) % gradients.length;

    const gradient = gradients[colorIndex];
    const borderColor = baseColors[colorIndex];

    return (
        <div className='relative w-full h-72' style={{ perspective: '1000px' }}>
            <div
                className='relative w-full h-full transition-transform duration-500 transform-gpu cursor-pointer'
                style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
                onClick={handleFlip}
            >

                {/* FRONT SIDE */}
                <div
                    className='absolute inset-0 w-full h-full bg-white/80 backdrop-blur-xl rounded-2xl p-8 flex flex-col justify-between'
                    style={{
                        border: `2px solid ${borderColor}`,
                        boxShadow: `0 10px 25px -5px ${borderColor}55`,
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden'
                    }}
                >

                    <div className='flex items-start justify-between'>
                        <div className='bg-slate-100 text-[10px] text-slate-600 rounded px-4 py-1 uppercase'>
                            {flashcard?.difficulty}
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleStar(flashcard._id);
                            }}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${flashcard.isStarred
                                    ? 'bg-linear-to-br from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-500/25'
                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-amber-500'
                                }`}
                        >
                            <Star
                                className='w-4 h-4'
                                strokeWidth={2}
                                fill={flashcard.isStarred ? 'currentColor' : 'none'}
                            />
                        </button>
                    </div>

                    <div className='flex-1 flex items-center justify-center px-4 py-6'>
                        <p className='text-lg font-semibold text-slate-900 text-center leading-relaxed'>
                            {flashcard.question}
                        </p>
                    </div>

                    <div className='flex items-center gap-2 text-xs text-slate-400 font-medium'>
                        <RotateCcw className='w-3.5 h-3.5' strokeWidth={2} />
                        <span>Click to reveal answer</span>
                    </div>

                </div>


                {/* BACK SIDE */}
                <div
                    className="absolute inset-0 w-full h-full rounded-2xl shadow-xl overflow-hidden flex flex-col justify-between"
                    style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        background: gradient
                    }}
                >

                    <div className="absolute -right-20 -top-10 w-72 h-72 bg-white/20 rounded-full"></div>
                    <div className="absolute right-0 bottom-0 w-64 h-64 bg-black/10 rounded-full translate-x-20 translate-y-20"></div>

                    <div className='relative flex items-start justify-between gap-2 p-6'>

                        <div>
                            <p className='text-white text-lg font-semibold'>
                                {flashcard.question}
                            </p>
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleStar(flashcard._id);
                            }}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0 ${flashcard.isStarred
                                    ? 'bg-white text-yellow-500'
                                    : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                        >
                            <Star
                                className='w-4 h-4'
                                strokeWidth={2}
                                fill={flashcard.isStarred ? 'currentColor' : 'none'}
                            />
                        </button>

                    </div>

                    <div className='relative flex-1 flex items-center justify-center px-6'>
                        <p className='text-white text-sm leading-relaxed text-center font-medium'>
                            {flashcard.answer}
                        </p>
                    </div>

                    <div className='relative flex items-center justify-center gap-2 pb-5 text-xs text-white/70 font-medium'>
                        <RotateCcw className='w-3.5 h-3.5' strokeWidth={2} />
                        <span>Click to see question</span>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default Flashcard;