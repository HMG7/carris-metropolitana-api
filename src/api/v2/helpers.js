const originalData = require("../../../data/original_data");

exports.filterRoutes = (routes, filter) => {
  let filteredRoutes = routes;
  const validRouteFilters = ["previousRouteId", "currentRouteId"];
  for (const validFilter of validRouteFilters) {
    filteredRoutes = filter[validFilter]
      ? filteredRoutes.filter(r => r[validFilter]?.includes(filter[validFilter]))
      : filteredRoutes;
  }

  filteredRoutes = filter.limit ? filteredRoutes.slice(0, filter.limit) : filteredRoutes;
  return filteredRoutes;
};

exports.getPreviousRoute = (currentRoute) => {
  const previousRoutes = Object.assign({}, ...Object.entries(originalData.routesConversion)
    .flatMap(([_, routes]) => routes));
  const previousRoute = Object.entries(previousRoutes).find(([previousRoute, newRoutes]) => newRoutes.map(route => route[0]).includes(currentRoute));
  return previousRoute ? previousRoute[0] : undefined;
};

exports.getRouteDirections = (id) => {
  const currentRouteId = id.includes("_") ? id.substring(0, 4) : id;
  const directions = originalData.routeSchedules[currentRouteId];
  const names = originalData.routeNames[currentRouteId];

  if (!directions) return [];

  return Object.entries(directions)
    .filter(direction => (direction[1].length > 0))
    .flatMap((direction) => direction[1].map((name, idx) => {
      const [start, end] = names[direction[0]].replace(/<[^>]+>/g, "").split("🠖").map(s => s.trim());
      return {
        id: name.replace(".json", ""),
        direction: direction[0],
        start,
        end
      };
    }
    ));
};

exports.getRoutes = () => {
  let routes = [];
  const currentRouteIds = Object.keys(originalData.routeSchedules);
  for (const currentRouteId of currentRouteIds) {
    const directions = this.getRouteDirections(currentRouteId);
    routes = routes.concat(directions.map(direction => ({
      directionId: direction.id,
      direction: direction.direction,
      currentRouteId,
      previousRouteId: this.getPreviousRoute(currentRouteId),
      start: direction.start.replace(" | Circular", ""),
      end: direction.end
    })));
  }

  return routes;
};