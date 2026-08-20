import { Component, useMemo, type ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";
import { AppleMaps, GoogleMaps } from "expo-maps";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import type { FieldJobListItem } from "@/lib/types";
import { colors } from "@/lib/theme";
import { formatTimeLabel } from "@/lib/utils";
import { SectionPanel } from "@/components/ui";

type Job = FieldJobListItem;

type Stop = {
  id: string;
  index: number;
  status: Job["status"];
  time: string | null;
  serviceName: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
};

/** City centers used when a property has no stored coordinates yet. */
const CITY_COORDS: Record<string, { latitude: number; longitude: number }> = {
  Dallas: { latitude: 32.7767, longitude: -96.797 },
  Plano: { latitude: 33.0198, longitude: -96.6989 },
  "Fort Worth": { latitude: 32.7555, longitude: -97.3308 },
  Arlington: { latitude: 32.7357, longitude: -97.1081 },
  Frisco: { latitude: 33.1507, longitude: -96.8236 },
  Southlake: { latitude: 32.9412, longitude: -97.1344 },
  Grapevine: { latitude: 32.934, longitude: -97.0781 },
};

function asCoordinate(value: unknown) {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function coordinatesFor(property: Job["property"]) {
  const latitude = asCoordinate(property.latitude);
  const longitude = asCoordinate(property.longitude);
  if (latitude != null && longitude != null) {
    return { latitude, longitude };
  }
  return CITY_COORDS[property.city] ?? null;
}

function routeStops(jobs: Job[]): Stop[] {
  return jobs.map((job, index) => {
    const coords = coordinatesFor(job.property);
    return {
      id: job.id,
      index: index + 1,
      status: job.status,
      time: job.scheduledTime,
      serviceName: job.service.name,
      city: job.property.city,
      latitude: coords?.latitude ?? null,
      longitude: coords?.longitude ?? null,
    };
  });
}

function cameraForStops(stops: Stop[]) {
  const plotted = stops.filter(
    (stop): stop is Stop & { latitude: number; longitude: number } =>
      stop.latitude != null && stop.longitude != null,
  );
  const lats = plotted.map((stop) => stop.latitude);
  const lngs = plotted.map((stop) => stop.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const span = Math.max(maxLat - minLat, maxLng - minLng, 0.05) * 1.7;
  return {
    coordinates: {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
    },
    zoom: Math.max(8, Math.min(13.5, Math.log2(360 / span) - 1.4)),
  };
}

class MapBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <View className="flex-1 items-center justify-center bg-surface">
          <Ionicons name="map-outline" size={28} color={colors.muted} />
          <Text className="mt-2 px-6 text-center text-sm text-slate-400">
            Map needs a native rebuild. The stop list below still works.
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function RouteMap({ stops }: { stops: Stop[] }) {
  const plotted = useMemo(
    () =>
      stops.filter(
        (stop): stop is Stop & { latitude: number; longitude: number } =>
          stop.latitude != null && stop.longitude != null,
      ),
    [stops],
  );
  const cameraPosition = useMemo(() => cameraForStops(plotted), [plotted]);
  const coordinates = useMemo(
    () =>
      plotted.map((stop) => ({
        latitude: stop.latitude,
        longitude: stop.longitude,
      })),
    [plotted],
  );
  const appleMarkers = useMemo(
    () =>
      plotted.map((stop) => ({
        id: stop.id,
        coordinates: {
          latitude: stop.latitude,
          longitude: stop.longitude,
        },
        title: `${stop.index}. ${stop.serviceName}`,
        monogram: String(stop.index),
        tintColor: stop.status === "IN_PROGRESS" ? colors.lime : "#60a5fa",
      })),
    [plotted],
  );
  const googleMarkers = useMemo(
    () =>
      plotted.map((stop) => ({
        id: stop.id,
        coordinates: {
          latitude: stop.latitude,
          longitude: stop.longitude,
        },
        title: `${stop.index}. ${stop.serviceName}`,
        snippet: stop.city,
      })),
    [plotted],
  );
  const polylines = useMemo(
    () =>
      coordinates.length < 2
        ? []
        : [
            {
              id: "today-route",
              coordinates,
              color: colors.lime,
              width: 4,
            },
          ],
    [coordinates],
  );

  if (plotted.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <Ionicons name="map-outline" size={28} color={colors.muted} />
        <Text className="mt-2 text-sm text-slate-400">
          Stop locations will show here
        </Text>
      </View>
    );
  }

  if (Platform.OS === "ios") {
    return (
      <AppleMaps.View
        style={StyleSheet.absoluteFill}
        colorScheme={AppleMaps.MapColorScheme.DARK}
        cameraPosition={cameraPosition}
        markers={appleMarkers}
        polylines={polylines}
        properties={{
          selectionEnabled: false,
          pointsOfInterest: { including: [] },
        }}
        uiSettings={{
          compassEnabled: false,
          myLocationButtonEnabled: false,
          scaleBarEnabled: false,
          togglePitchEnabled: false,
        }}
      />
    );
  }

  if (Platform.OS === "android") {
    return (
      <GoogleMaps.View
        style={StyleSheet.absoluteFill}
        colorScheme={GoogleMaps.MapColorScheme.DARK}
        cameraPosition={cameraPosition}
        markers={googleMarkers}
        polylines={polylines}
        uiSettings={{
          compassEnabled: false,
          myLocationButtonEnabled: false,
          mapToolbarEnabled: false,
          zoomControlsEnabled: false,
          scrollGesturesEnabled: false,
          zoomGesturesEnabled: false,
          rotationGesturesEnabled: false,
          tiltGesturesEnabled: false,
        }}
      />
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-surface">
      <Ionicons name="map-outline" size={28} color={colors.muted} />
      <Text className="mt-2 text-sm text-slate-400">
        Map preview is on iOS and Android
      </Text>
    </View>
  );
}

/** Compact route map of today's jobs, with a numbered stop list underneath. */
export function TodayGlanceMap({
  jobs,
  onSelectJob,
}: {
  jobs: Job[];
  onSelectJob: (jobId: string) => void;
}) {
  const stops = useMemo(() => routeStops(jobs), [jobs]);
  if (stops.length === 0) return null;

  const first = stops[0]?.time;
  const last = stops[stops.length - 1]?.time;
  const window =
    first && last && first !== last
      ? `${formatTimeLabel(first)} – ${formatTimeLabel(last)}`
      : first
        ? formatTimeLabel(first)
        : null;

  return (
    <SectionPanel
      title="Today at a glance"
      count={stops.length}
      className="mt-8"
    >
      <View className="h-60 overflow-hidden rounded-3xl border border-line">
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <MapBoundary>
            <RouteMap stops={stops} />
          </MapBoundary>
        </View>
      </View>
      {window ? (
        <Text className="mt-2 text-sm text-slate-400">
          {stops.length} stop{stops.length === 1 ? "" : "s"} · {window}
        </Text>
      ) : null}

      <View className="mt-3">
        {stops.map((stop) => (
          <Pressable
            key={stop.id}
            onPress={() => onSelectJob(stop.id)}
            accessibilityRole="button"
            accessibilityLabel={`Stop ${stop.index}, ${stop.serviceName} in ${stop.city}`}
            className="flex-row items-center gap-3 rounded-2xl px-1 py-2.5 active:opacity-70"
          >
            <View
              className={`h-8 w-8 items-center justify-center rounded-full ${
                stop.status === "IN_PROGRESS"
                  ? "bg-brand-lime"
                  : "bg-blue-500/25"
              }`}
            >
              <Text
                className={`text-sm font-bold ${
                  stop.status === "IN_PROGRESS"
                    ? "text-brand-ink"
                    : "text-blue-100"
                }`}
              >
                {stop.index}
              </Text>
            </View>
            <View className="min-w-0 flex-1">
              <Text
                className="text-[15px] font-semibold text-white"
                numberOfLines={1}
              >
                {stop.serviceName}
              </Text>
              <Text className="mt-0.5 text-sm text-slate-400" numberOfLines={1}>
                {stop.city}
                {stop.time ? ` · ${formatTimeLabel(stop.time)}` : ""}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.muted} />
          </Pressable>
        ))}
      </View>
    </SectionPanel>
  );
}
