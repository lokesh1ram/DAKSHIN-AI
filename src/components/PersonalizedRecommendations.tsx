import React from "react";

interface PersonalizedRecommendationsProps {
  recommendations: string[];
}

export const PersonalizedRecommendations: React.FC<PersonalizedRecommendationsProps> = ({
  recommendations,
}) => {
  const items = recommendations.length > 0 ? recommendations : [
    "Maintain a balanced diet rich in whole grains, vegetables, and lean proteins.",
    "Aim for at least 150 minutes of moderate physical activity per week.",
    "Stay hydrated by drinking enough water throughout the day.",
    "Prioritize 7-9 hours of quality sleep each night.",
  ];

  return (
    <div className="wellness-card p-6 sm:p-7">
      <h2 className="text-lg font-bold tracking-tight text-slate-900">Personalized Recommendations</h2>

      <div className="mt-5 space-y-4">
        {items.map((rec, idx) => (
          <div key={idx} className="flex items-start gap-3.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
              {idx + 1}
            </span>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-0.5">{rec}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
