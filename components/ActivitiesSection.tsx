
import React from 'react';
import { Activity as ActivityType } from '../types';

interface ActivitiesSectionProps {
  TranslatableText: React.FC<{ text: string }>;
  activities: ActivityType[];
}

const ActivitiesSection: React.FC<ActivitiesSectionProps> = ({ TranslatableText, activities }) => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            <TranslatableText text="Initiated Activities" />
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            <TranslatableText text="Beyond education, we drive real impact through ground-level conservation projects." />
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {activities.map((activity, idx) => (
            <div key={idx} className="group relative overflow-hidden rounded-3xl bg-slate-50 p-1">
              <div className="bg-white rounded-[22px] p-8 h-full transition-transform group-hover:-translate-y-1">
                <div className="text-5xl mb-6">{activity.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  <TranslatableText text={activity.title} />
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  <TranslatableText text={activity.description} />
                </p>
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <button className="text-blue-600 font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                    <TranslatableText text="Learn More" /> →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 p-8 rounded-3xl bg-blue-50 border border-blue-100">
          <h4 className="text-xl font-bold text-blue-900 mb-6 text-center">
            <TranslatableText text="Targeted Beneficiaries" />
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Children', 'Teenagers', 'Young People', 'Adults'].map((group) => (
              <div key={group} className="bg-white p-4 rounded-xl text-center shadow-sm">
                <span className="block font-bold text-blue-700">
                  <TranslatableText text={group} />
                </span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-blue-800 italic">
            <TranslatableText text="* Adults can earn a Water Hero Certificate upon completing lessons with 80% score." />
          </p>
        </div>
      </div>
    </section>
  );
};

export default ActivitiesSection;
