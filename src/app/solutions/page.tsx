import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Building, 
  Lightbulb, 
  MapPin, 
  Code, 
  Brain, 
  Users,
  ArrowRight,
  ChevronRight
} from "lucide-react";

const solutionCards = [
  {
    icon: <Building className="h-8 w-8" />,
    title: "Enterprise",
    description: "Power your competitive advantage with TrustLance Enterprise.",
    href: "#"
  },
  {
    icon: <Lightbulb className="h-8 w-8" />,
    title: "Innovation Challenges", 
    description: "Turn challenges into breakthroughs with the largest innovation hub.",
    href: "#"
  },
  {
    icon: <MapPin className="h-8 w-8" />,
    title: "Field Services",
    description: "Deliver expertise anywhere in the world at scale – on demand.",
    href: "#"
  },
  {
    icon: <Code className="h-8 w-8" />,
    title: "TrustLance API",
    description: "Use the TrustLance API to access a cloud workforce of skilled freelancers.",
    href: "#"
  },
  {
    icon: <Brain className="h-8 w-8" />,
    title: "AI for Business",
    description: "Let experts in the latest AI technology transform your business.",
    href: "#"
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Local Jobs",
    description: "Get help in any location, anywhere in the world.",
    href: "#"
  }
];

const howItWorksCards = [
  {
    title: "How to hire the perfect freelancer for your project",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=200&fit=crop",
    href: "#"
  },
  {
    title: "How to get started earning money",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop", 
    href: "#"
  }
];

const ideaLinks = [
  "Get Web Design Ideas",
  "Get Mobile App Ideas", 
  "Get Graphic Design Ideas",
  "Get Logo Design Ideas",
  "Get 3D Modelling Ideas",
  "Get Illustration Ideas",
  "Get Branding Ideas",
  "Get Product Design Ideas"
];

const resourceLinks = [
  "What Is Adobe Photoshop",
  "What Is Android App Development",
  "What Is Article Writing", 
  "What Is Data Entry",
  "What Is Graphic Design",
  "What Is HTML",
  "What Is Internet Marketing"
];

const trustLanceProducts = [
  "How it works", "Contests", "Quotes", "Photo Anywhere", "Showcase"
];

const trustLanceServices = [
  "Preferred Freelancer Program", "Verified by TrustLance", "Project management", 
  "Recruiter", "Memberships"
];

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left & Center: Solution Cards */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {solutionCards.map((solution, index) => (
                <Link key={index} href={solution.href}>
                  <Card className="bg-slate-700/50 border-slate-600/30 hover:bg-slate-700/70 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer h-full">
                    <CardContent className="p-6">
                      <div className="text-blue-400 mb-4">
                        {solution.icon}
                      </div>
                      <h3 className="text-xl font-semibold mb-3 text-white">
                        {solution.title}
                      </h3>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {solution.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-8">
            {/* How it works */}
            <div>
              <h2 className="text-2xl font-bold mb-6">How it works</h2>
              <div className="space-y-4">
                {howItWorksCards.map((card, index) => (
                  <Link key={index} href={card.href}>
                    <Card className="bg-slate-700/50 border-slate-600/30 hover:bg-slate-700/70 transition-colors cursor-pointer overflow-hidden">
                      <div className="relative">
                        <Image
                          src={card.image}
                          alt={card.title}
                          width={400}
                          height={200}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
                          <div className="p-4 w-full">
                            <h3 className="text-white font-medium text-sm mb-2">
                              {card.title}
                            </h3>
                            <div className="flex items-center text-blue-400 text-xs">
                              Find out more
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Get Ideas */}
            <div>
              <h2 className="text-xl font-bold mb-4">Get ideas</h2>
              <div className="space-y-2">
                {ideaLinks.map((link, index) => (
                  <Link 
                    key={index} 
                    href="#" 
                    className="block text-sm text-slate-300 hover:text-blue-400 hover:underline transition-colors py-1"
                  >
                    {link}
                  </Link>
                ))}
                <Link 
                  href="#" 
                  className="block text-sm text-blue-400 hover:underline mt-3 flex items-center"
                >
                  View all
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Link>
              </div>
            </div>

            {/* Resources */}
            <div>
              <h2 className="text-xl font-bold mb-4">Resources</h2>
              <div className="space-y-2">
                {resourceLinks.map((link, index) => (
                  <Link 
                    key={index} 
                    href="#" 
                    className="block text-sm text-slate-300 hover:text-blue-400 hover:underline transition-colors py-1"
                  >
                    {link}
                  </Link>
                ))}
                <Link 
                  href="#" 
                  className="block text-sm text-blue-400 hover:underline mt-3 flex items-center"
                >
                  View all
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 pt-8 border-t border-slate-600/30">
          {/* TrustLance Products */}
          <div>
            <h2 className="text-xl font-bold mb-4">TrustLance Products</h2>
            <div className="space-y-2">
              {trustLanceProducts.map((product, index) => (
                <Link 
                  key={index} 
                  href="#" 
                  className="block text-sm text-slate-300 hover:text-blue-400 hover:underline transition-colors py-1"
                >
                  {product}
                </Link>
              ))}
            </div>
          </div>

          {/* TrustLance Services */}
          <div>
            <h2 className="text-xl font-bold mb-4">TrustLance Services</h2>
            <div className="space-y-2">
              {trustLanceServices.map((service, index) => (
                <Link 
                  key={index} 
                  href="#" 
                  className="block text-sm text-slate-300 hover:text-blue-400 hover:underline transition-colors py-1"
                >
                  {service}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 