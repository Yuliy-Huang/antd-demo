import request from './request'

export function getElevatorInfoApi(params: any) {
    return request({
        url: "/elevator_info",
        method: "get",
        params: params,
    });
}


export function startElevatorApi(params: any) {
    return request({
        url: "/start_elevator",
        method: "get",
        params: params,
    });
}

export function stopElevatorApi(params: any) {
    return request({
        url: "/elevator_pause",
        method: "get",
        params: params,
    });
}

export function callElevatorInsideApi(params: any) {
    return request({
        url: "/call_elevator_inside",
        method: "post",
        data: params,
    });
}

export function callElevatorOutsideApi(params: any) {
    return request({
        url: "/call_elevator_outside",
        method: "post",
        data: params,
    });
}


export function openDoorApi(params: any) {
    return request({
        url: "/open_door",
        method: "get",
        params: params,
    });
}

export function closeDoorApi(params: any) {
    return request({
        url: "/close_door",
        method: "get",
        params: params,
    });
}



