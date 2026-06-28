import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { ArrowRight, Sparkles, Zap, Gauge, Shield } from 'lucide-react'
import Link from 'next/link'
import { TOOLS, CATEGORY_INFO, TOOLS_CATEGORIES } from '@/lib/constants'

export default function Home() {
  const featuredTools = TOOLS.slice(0, 6)
  const categories = Object.values(TOOLS_CATEGORIES)
  
  const categoryColors: Record<string, { bg: string; icon: string }> = {
    developer: { bg: 'from-blue-500 to-blue-600', icon: '💻' },
    validation: { bg: 'from-purple-500 to-purple-600', icon: '✓' },
    formatter: { bg: 'from-cyan-500 to-cyan-600', icon: '📋' },
    converter: { bg: 'from-orange-500 to-orange-600', icon: '🔄' },
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-background to-secondary">
        {/* Hero Section */}
        <section className="container-main py-20 md:py-32 flex flex-col items-center text-center gap-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 animate-fade-in">
            <Sparkles size={18} className="text-primary" />
            <span className="text-sm font-semibold text-primary">Free Developer Toolkit</span>
          </div>

          <div className="flex flex-col gap-6 max-w-4xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-6xl md:text-7xl font-bold text-balance leading-tight">
              Developer Tools to Make
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Your Work Simple
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground text-balance max-w-3xl mx-auto">
              Access 100+ free tools for formatting, converting, generating, and debugging. No signup, no limits, no nonsense.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Link href="/tools" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:shadow-primary/30">
              Explore Tools
              <ArrowRight size={20} />
            </Link>
            <Link href="#categories" className="btn-secondary inline-flex items-center gap-2 text-lg px-8 py-3 rounded-xl font-semibold hover:bg-muted">
              Browse Categories
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-12 w-full max-w-2xl animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">{TOOLS.length}+</p>
              <p className="text-muted-foreground text-sm">Tools Available</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">Instant</p>
              <p className="text-muted-foreground text-sm">No Setup Required</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">Forever</p>
              <p className="text-muted-foreground text-sm">100% Free</p>
            </div>
          </div>
        </section>

        {/* Tool Categories - Vibrant Grid */}
        <section id="categories" className="container-main py-20 md:py-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Browse by Category</h2>
            <p className="text-lg text-muted-foreground text-balance">
              Find exactly what you need from our organized collection
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => {
              const info = CATEGORY_INFO[category]
              const colors = categoryColors[category] || categoryColors.utility
              return (
                <Link key={category} href={`/tools?category=${category}`}>
                  <div className={`group bg-gradient-to-br ${colors.bg} rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer min-h-48 flex flex-col justify-between`}>
                    <div>
                      <div className="text-5xl mb-3 opacity-80 group-hover:opacity-100 transition-opacity">
                        {colors.icon}
                      </div>
                      <h3 className="font-bold text-lg md:text-xl mb-2 text-white">
                        {info.name}
                      </h3>
                      <p className="text-sm text-white/80 line-clamp-2">
                        {info.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-white/90 text-sm font-medium group-hover:gap-3 transition-all">
                      <span>Explore</span>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Features */}
        <section className="container-main py-20 md:py-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Why Choose DevTools?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-base group hover:border-primary/50">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 w-fit mb-4 group-hover:scale-110 transition-transform">
                <Zap size={28} className="text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-3">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Optimized for speed. All tools run instantly in your browser with zero lag.
              </p>
            </div>

            <div className="card-base group hover:border-primary/50">
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 w-fit mb-4 group-hover:scale-110 transition-transform">
                <Gauge size={28} className="text-purple-600" />
              </div>
              <h3 className="font-bold text-lg mb-3">Powerful & Flexible</h3>
              <p className="text-muted-foreground">
                Comprehensive tools with advanced options for professional developers.
              </p>
            </div>

            <div className="card-base group hover:border-primary/50">
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-100 to-green-50 w-fit mb-4 group-hover:scale-110 transition-transform">
                <Shield size={28} className="text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-3">Private & Secure</h3>
              <p className="text-muted-foreground">
                Your data stays in your browser. We don&apos;t store or process any of your information.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Tools */}
        <section className="container-main py-20 md:py-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Most Popular Tools</h2>
            <p className="text-lg text-muted-foreground">Get started with our most-used utilities</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {featuredTools.map((tool) => (
              <Link key={tool.id} href={`/tools/${tool.id}`}>
                <div className="card-base group hover:shadow-lg hover:border-primary/50">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors flex-1">
                      {tool.name}
                    </h3>
                    <ArrowRight size={20} className="text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">
                    {tool.description}
                  </p>
                  <div className="inline-flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all">
                    <span>Try it now</span>
                    <Sparkles size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link href="/tools" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl">
              View All Tools
              <ArrowRight size={20} />
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
