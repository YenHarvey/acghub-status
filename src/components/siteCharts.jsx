import {Alert, Collapse} from "antd";
import {MacScrollbar} from "mac-scrollbar";
import {Line} from "@ant-design/plots";

const translations = {
    siteIssuesWarning: "The site is currently experiencing issues, please check the site status", // 当前站点出现异常，请检查站点状态
    siteSustainedIssues: "The site is experiencing sustained issues, please check immediately or remove it from monitoring", // 当前站点持续异常，请立即检查站点状态或从监控项目中删除
    siteNormalStatus: "The site is running normally, keep up the good work!", // 当前站点状态正常，请继续保持哦
    initialSiteData: "Initial Site Data", // 站点详情初始数据
    dailyUptime: "Daily Uptime", // 当日可用率
};

const SiteCharts = ({siteDetails}) => {
    // 处理传入数据为图表
    const dailyData = siteDetails.daily;
    const chartData = [...dailyData].reverse().map((data) => {
        const {uptime, date} = data;
        return {
            time: date.format("YYYY-MM-DD"), // 格式化日期
            value: uptime, // 每日可用率
        };
    });

    // 图标配置
    const chartConfig = {
        data: chartData,
        padding: "auto",
        xField: "time",
        yField: "value",
        offsetY: 0,
        meta: {
            value: {
                alias: translations.dailyUptime, // 当日可用率
                formatter: (v) => `${v}%`, // 格式化显示为百分比
            },
        },
        xAxis: {
            tickCount: chartData.length, // x轴上的刻度数量
        },
        smooth: true, // 平滑曲线
    };

    return (
        <MacScrollbar style={{maxHeight: "66vh"}}>
            <div className="site-details">
                {siteDetails.status !== "ok" ? (
                    siteDetails.average >= 70 ? (
                        <Alert
                            message={translations.siteIssuesWarning} // 当前站点出现异常，请检查站点状态
                            type="warning"
                            showIcon
                        />
                    ) : (
                        <Alert
                            message={translations.siteSustainedIssues} // 当前站点持续异常，请立即检查站点状态或从监控项目中删除
                            type="error"
                            showIcon
                        />
                    )
                ) : (
                    <Alert
                        message={translations.siteNormalStatus} // 当前站点状态正常，请继续保持哦
                        type="success"
                        showIcon
                    />
                )}
                <div className="all">
                    <Line {...chartConfig} />
                    <Collapse
                        style={{marginTop: "20px"}}
                        items={[
                            {
                                key: "all-data",
                                label: translations.initialSiteData, // 站点详情初始数据
                                children: <p>{JSON.stringify(siteDetails)}</p>,
                            },
                        ]}
                    />
                </div>
            </div>
        </MacScrollbar>
    );
};

export default SiteCharts;
