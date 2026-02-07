import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Building2, User, Clock, CheckCircle2, Bookmark } from 'lucide-react';
import type { Project } from '../lib/mock-data';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Quran Apps': 'bg-blue-100 text-blue-700 border-blue-200',
      'Prayer': 'bg-purple-100 text-purple-700 border-purple-200',
      'Charity & Zakat': 'bg-orange-100 text-orange-700 border-orange-200',
      'Islamic EdTech': 'bg-green-100 text-green-700 border-green-200',
      'Halal Finance': 'bg-pink-100 text-pink-700 border-pink-200',
      'Community': 'bg-teal-100 text-teal-700 border-teal-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'open': 'text-green-600',
      'active': 'text-yellow-600',
      'completed': 'text-gray-600'
    };
    return colors[status] || 'text-gray-600';
  };

  const getImpactBadge = () => {
    if (project.category === 'Quran Apps' || project.category === 'Prayer') {
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Sadaqah Jariyah Impact
        </Badge>
      );
    }
    if (project.category === 'Charity & Zakat') {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          Community Utility
        </Badge>
      );
    }
    if (project.category === 'Islamic EdTech') {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Education
        </Badge>
      );
    }
    return null;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" onClick={onClick}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {project.isOrganization ? (
              <Building2 className="w-4 h-4 text-teal-600" />
            ) : (
              <User className="w-4 h-4 text-gray-500" />
            )}
            <span className="text-sm text-muted-foreground">
              by {project.organization || 'Individual'}
            </span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
            <Bookmark className="w-4 h-4" />
          </Button>
        </div>

        <h3 className="font-semibold text-lg mb-2 group-hover:text-teal-700 transition-colors">
          {project.title}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className={getCategoryColor(project.category)}>
            {project.category}
          </Badge>
          {getImpactBadge()}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {project.skills.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{project.skills.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span className={getStatusColor(project.status)}>
                Active {project.lastActive || project.postedDate}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              <span>{project.contributorCount} contributors</span>
            </div>
          </div>
          
          <Button size="sm" className="bg-teal-700 hover:bg-teal-800">
            Contribute
          </Button>
        </div>
      </div>
    </Card>
  );
}
