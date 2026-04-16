export const jsonFormatError = (_req, res, next) => {
    res.sendError = (message, statusCode = 500) => {
        return res.status(statusCode).json({ errors: [{ msg: message }] });
    }

    next();
}

export const resValidationStatus = (_req, res, next) => {
    res.validationStatus = () => {
        res.status(res.statusCode && res.statusCode >= 400 ? res.statusCode : 422);
        return res;
    }

    next();
}