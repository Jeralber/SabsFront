import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface NavigationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  targetRoute: string;
  showBackButton?: boolean;
  backRoute?: string;
  className?: string;
}

export const NavigationCard: React.FC<NavigationCardProps> = ({
  title,
  description,
  icon,
  targetRoute,
  showBackButton = false,
  backRoute,
  className = ''
}) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(targetRoute);
  };

  const handleBack = () => {
    if (backRoute) {
      navigate(backRoute);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <div className="p-6">
        {showBackButton && (
          <button
            onClick={handleBack}
            className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Volver</span>
          </button>
        )}
        
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {description}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleNavigate}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <span>Ir a {title}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};