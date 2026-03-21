export const pingTest = (req, res, next) => {
    try {
        res.status(200).json({
            msg: "API is up and runnig",
            processId: process.pid,
        });
    } catch (err) {
        res.status(500).json({
            msg: "Somethig went wrong",
            error: err.message
        });
    }
}