// export function top5ToursRouteAlias(request, response, next) {
//   //   request.query = request.query || {};
//   //   request.query.limit = "5";
//   //   console.log(request.query.limit);
//   //   request.query.sort = "-ratingsAverage,price";
//   //   request.query.fields = "name,price,ratingsAverage,summary,difficulty";

//   console.log(request.query);
//   next();
// }

export function top5ToursRouteAlias(request, response, next) {
  Object.defineProperty(request, "query", {
    value: {
      ...request.query,
      limit: "5",
      sort: "-ratingsAverage,price",
      fields: "name,price,ratingsAverage,summary,difficulty",
    },
    writable: true,
    configurable: true,
    enumerable: true,
  });

  next();
}
