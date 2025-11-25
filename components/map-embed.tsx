import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, MapIcon } from "lucide-react"
import site from "@/config/site.json"

// Static embed component - no API key required
export function MapEmbed() {
  const { embedSrc, openInMapsUrl } = site.map

  return (
    <Card className="border-muted">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Find Us
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full overflow-hidden rounded-lg border bg-muted">
          <iframe
            title="Satya Store location map"
            className="w-full h-[300px]"
            referrerPolicy="no-referrer-when-downgrade"
            loading="lazy"
            src={embedSrc}
            allowFullScreen
          />
        </div>
        <div className="mt-4">
          <Button asChild variant="secondary" className="w-full sm:w-auto">
            <a href={openInMapsUrl} target="_blank" rel="noopener noreferrer">
              <MapIcon className="w-4 h-4 mr-2" />
              Open in Google Maps
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
