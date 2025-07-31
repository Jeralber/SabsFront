import React from 'react';
import { NavigationCard } from './NavigationCard';
import { Building, MapPin, Network } from 'lucide-react';

interface CentroAreaNavigationProps {
  showBackButton?: boolean;
  backRoute?: string;
  className?: string;
}

export const CentroAreaNavigation: React.FC<CentroAreaNavigationProps> = ({
  showBackButton = false,
  backRoute,
  className = ''
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      <NavigationCard
        title="Centros"
        description="Gestionar centros de formación"
        icon={<Building className="h-6 w-6 text-blue-600" />}
        targetRoute="/centros"
        showBackButton={showBackButton}
        backRoute={backRoute}
      />
      
      <NavigationCard
        title="Áreas"
        description="Gestionar áreas de conocimiento"
        icon={<MapPin className="h-6 w-6 text-green-600" />}
        targetRoute="/areas"
        showBackButton={showBackButton}
        backRoute={backRoute}
      />
      
      <NavigationCard
        title="Área Centro"
        description="Gestionar relaciones entre áreas y centros"
        icon={<Network className="h-6 w-6 text-purple-600" />}
        targetRoute="/area-centro"
        showBackButton={showBackButton}
        backRoute={backRoute}
      />
    </div>
  );
};