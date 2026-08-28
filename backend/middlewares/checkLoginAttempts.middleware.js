import AppError from "../utils/appError.util.js";
import catchAsync from "../utils/catchAsync.util.js";
import { RateLimiterMemory } from "rate-limiter-flexible";

const loginLimiter = new RateLimiterMemory({
  points: 10,
  duration: 10 * 60,
  blockDuration: 60 * 60,
});

const checkLoginAttempts = catchAsync(async (request, response, next) => {
  try {
    await loginLimiter.consume(request.ip);

    next();
  } catch (rateLimitRes) {
    const secondsBeforeNext = Math.round(rateLimitRes.msBeforeNext / 1000) || 1;

    response.set("Retry-After", String(secondsBeforeNext));

    return next(
      new AppError(
        `Account locked due to too many failed attempts. Please try again in ${secondsBeforeNext} seconds.`,
        429,
      ),
    );
  }
});

export default checkLoginAttempts;
