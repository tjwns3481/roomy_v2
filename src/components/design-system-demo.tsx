// @TASK P8-S1-T1 - AirBnB 디자인 시스템 데모 컴포넌트
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Heart, Star, Search } from 'lucide-react';

export function DesignSystemDemo() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Hero Section */}
        <section>
          <h1 className="text-display font-bold text-text-primary mb-4">
            AirBnB Design System
          </h1>
          <p className="text-body-lg text-text-secondary">
            따뜻하고 환영하는 디자인 - Roomy
          </p>
        </section>

        {/* Colors */}
        <section>
          <h2 className="text-h2 mb-6">Colors</h2>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="h-24 bg-primary rounded-xl mb-2"></div>
              <p className="text-body-sm text-text-secondary">Primary</p>
              <p className="text-caption text-text-tertiary">#FF385C</p>
            </div>
            <div>
              <div className="h-24 bg-secondary rounded-xl mb-2"></div>
              <p className="text-body-sm text-text-secondary">Secondary</p>
              <p className="text-caption text-text-tertiary">#00A699</p>
            </div>
            <div>
              <div className="h-24 bg-accent rounded-xl mb-2"></div>
              <p className="text-body-sm text-text-secondary">Accent</p>
              <p className="text-caption text-text-tertiary">#FC642D</p>
            </div>
            <div>
              <div className="h-24 bg-surface rounded-xl mb-2 border border-border"></div>
              <p className="text-body-sm text-text-secondary">Surface</p>
              <p className="text-caption text-text-tertiary">#F7F7F7</p>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="text-h2 mb-6">Typography</h2>
          <div className="space-y-4">
            <div>
              <h1 className="text-h1">Heading 1 - 32px Bold</h1>
            </div>
            <div>
              <h2 className="text-h2">Heading 2 - 24px SemiBold</h2>
            </div>
            <div>
              <h3 className="text-h3">Heading 3 - 20px SemiBold</h3>
            </div>
            <div>
              <h4 className="text-h4">Heading 4 - 18px Medium</h4>
            </div>
            <div>
              <p className="text-body-lg">Body Large - 18px Regular</p>
            </div>
            <div>
              <p className="text-body">Body - 16px Regular</p>
            </div>
            <div>
              <p className="text-body-sm">Body Small - 14px Regular</p>
            </div>
            <div>
              <p className="text-caption">Caption - 12px Regular</p>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section>
          <h2 className="text-h2 mb-6">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="default">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="destructive">Destructive Button</Button>
            <Button variant="default" size="sm">Small</Button>
            <Button variant="default" size="lg">Large</Button>
            <Button variant="default" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* Inputs */}
        <section>
          <h2 className="text-h2 mb-6">Inputs</h2>
          <div className="space-y-4 max-w-md">
            <Input placeholder="이메일을 입력하세요" type="email" />
            <Input placeholder="비밀번호를 입력하세요" type="password" />
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
              <Input placeholder="검색..." className="pl-12" />
            </div>
          </div>
        </section>

        {/* Cards */}
        <section>
          <h2 className="text-h2 mb-6">Cards</h2>
          <div className="grid grid-cols-3 gap-6">
            {/* Listing Card */}
            <Card className="group overflow-hidden p-0">
              <div className="relative aspect-[4/3] overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-primary to-secondary"></div>
                <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:scale-110 transition-transform">
                  <Heart className="w-4 h-4" />
                </button>
              </div>
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-text-primary">제주 해변 펜션</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">4.92</span>
                  </div>
                </div>
                <p className="text-text-secondary text-sm">제주시, 한국</p>
                <p className="mt-2">
                  <span className="font-semibold">₩120,000</span>
                  <span className="text-text-secondary"> /박</span>
                </p>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description goes here</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-body">This is a standard card component with header and content.</p>
              </CardContent>
            </Card>

            {/* Action Card */}
            <Card className="hover:border-primary cursor-pointer">
              <CardHeader>
                <CardTitle>Action Card</CardTitle>
                <CardDescription>Hover to see effect</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="default" className="w-full">Get Started</Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Shadows */}
        <section>
          <h2 className="text-h2 mb-6">Shadows</h2>
          <div className="grid grid-cols-5 gap-4">
            <div className="h-24 bg-white rounded-xl shadow-airbnb-sm flex items-center justify-center">
              <p className="text-body-sm text-text-secondary">SM</p>
            </div>
            <div className="h-24 bg-white rounded-xl shadow-airbnb-md flex items-center justify-center">
              <p className="text-body-sm text-text-secondary">MD</p>
            </div>
            <div className="h-24 bg-white rounded-xl shadow-airbnb-lg flex items-center justify-center">
              <p className="text-body-sm text-text-secondary">LG</p>
            </div>
            <div className="h-24 bg-white rounded-xl shadow-airbnb-xl flex items-center justify-center">
              <p className="text-body-sm text-text-secondary">XL</p>
            </div>
            <div className="h-24 bg-white rounded-xl shadow-airbnb-2xl flex items-center justify-center">
              <p className="text-body-sm text-text-secondary">2XL</p>
            </div>
          </div>
        </section>

        {/* Border Radius */}
        <section>
          <h2 className="text-h2 mb-6">Border Radius</h2>
          <div className="grid grid-cols-5 gap-4">
            <div className="h-24 bg-primary rounded-lg flex items-center justify-center text-white font-semibold">
              LG (8px)
            </div>
            <div className="h-24 bg-primary rounded-xl flex items-center justify-center text-white font-semibold">
              XL (12px)
            </div>
            <div className="h-24 bg-primary rounded-2xl flex items-center justify-center text-white font-semibold">
              2XL (16px)
            </div>
            <div className="h-24 bg-primary rounded-3xl flex items-center justify-center text-white font-semibold">
              3XL (24px)
            </div>
            <div className="h-24 w-24 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
              FULL
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
