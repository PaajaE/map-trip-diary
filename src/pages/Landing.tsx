import React from 'react';
import { Link } from 'react-router-dom';
import { Map, Camera, Mountain, Route, Shield, Cloud } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguagePicker } from '../components/common/LanguagePicker';

export function Landing() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      {/* Hero Section with Map Background */}
      <div className="relative h-screen">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?auto=format&fit=crop&q=80"
            alt="Topographic map with compass"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 to-gray-900/90" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="absolute top-4 right-4">
            <LanguagePicker />
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Map className="h-16 w-16 text-indigo-400" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight">
              <span className="block">{t('landing.hero.title')}</span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-indigo-200">
                {t('landing.hero.subtitle')}
              </span>
            </h1>
            <p className="mt-6 max-w-lg mx-auto text-xl text-gray-300">
              {t('landing.hero.description')}
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link
                to="/login"
                className="px-8 py-3 text-lg font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                {t('landing.hero.getStarted')}
              </Link>
              <a
                href="#features"
                className="px-8 py-3 text-lg font-medium rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors duration-200 backdrop-blur-sm"
              >
                {t('landing.hero.learnMore')}
              </a>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 rounded-full border-2 border-white/50 flex items-center justify-center">
            <div className="w-2 h-2 bg-white/50 rounded-full animate-ping" />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              {t('landing.features.title')}
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              {t('landing.features.subtitle')}
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="relative p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Map className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">
                {t('landing.features.maps.title')}
              </h3>
              <p className="mt-2 text-gray-600">
                {t('landing.features.maps.description')}
              </p>
            </div>

            <div className="relative p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Camera className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">
                {t('landing.features.photos.title')}
              </h3>
              <p className="mt-2 text-gray-600">
                {t('landing.features.photos.description')}
              </p>
            </div>

            <div className="relative p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Mountain className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">
                {t('landing.features.nature.title')}
              </h3>
              <p className="mt-2 text-gray-600">
                {t('landing.features.nature.description')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}