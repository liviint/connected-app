let dateFormat = (date) => {
    console.log(date,"helo date")
    return new Date(date).toLocaleDateString("en-KE", {
                year: "numeric",
                month: "long",
                day: "numeric",
            })
}
export {dateFormat}