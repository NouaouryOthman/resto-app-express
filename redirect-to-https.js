export default function redirectToHTTPS(request, response, next) {
    if(process.env.NODE_ENV === 'development') {
        if(!request.secure) {
            return response.redirect('https://' + request.headers.host + request.url);
        }

        next();
    }
    else {
        if(request.headers["x-forwarded-proto"] !== "https") {
            return response.redirect('https://' + request.headers.host + request.url);
        }

        next();
    }
}