import { useState } from "react";
import { SwitchTransition, CSSTransition } from "react-transition-group";
import { formatNumber, formatDuration } from "@/utils/timeTools";
import { LinkTwo } from "@icon-park/react";
import { Tooltip, Button, Result, Modal } from "antd";
import CustomLink from "@/components/customLink";
import SiteCharts from "@/components/siteCharts";

const translations = {
  normalAccess: "Normal Access", // 正常访问
  unknownStatus: "Unknown Status", // 状态未知
  cannotAccess: "Cannot Access", // 无法访问
  noData: "No Data", // 无数据
  retryError: "API limit exceeded or request error, please refresh and try again", // 调用超限或请求错误，请刷新后重试
  retry: "Retry", // 重试
  today: "Today", // 今天
  recentFailure: (days, times, duration, average) => `In the last ${days} days, there were ${times} failures totaling ${duration}. Average uptime ${average}%`, // 最近 {days} 天内故障 {times} 次，累计 {duration}，平均可用率 {average}%
  recentUptime: (days, average) => `In the last ${days} days, uptime was ${average}%`, // 最近 {days} 天内可用率 {average}%
};

const SiteStatus = ({ siteData, days, status }) => {
  // 弹窗数据
  const [siteDetailsShow, setSiteDetailsShow] = useState(false);
  const [siteDetailsData, setSiteDetailsData] = useState(null);

  // 是否显示链接
  const isShowLinks = import.meta.env.VITE_SHOW_LINKS === "true";

  // 开启弹窗
  const showSiteDetails = (data) => {
    setSiteDetailsShow(true);
    setSiteDetailsData(data);
  };

  // 关闭弹窗
  const closeSiteDetails = () => {
    setSiteDetailsShow(false);
    setSiteDetailsData(null);
  };

  return (
    <SwitchTransition mode="out-in">
      <CSSTransition key={status.siteState} classNames="fade" timeout={100}>
        {status.siteState !== "wrong" ? (
          status.siteState !== "loading" && siteData ? (
            <div className="sites">
              {siteData.map((site) => (
                <div
                  key={site.id}
                  className={`site ${
                    site.status !== "ok" ? "error" : "normal"
                  }`}
                >
                  <div className="meta">
                    <div className="name">{site.name}</div>
                    {isShowLinks ? (
                      <CustomLink iconDom={<LinkTwo />} to={site.url} />
                    ) : null}
                    <div
                      className={`status ${
                        site.status === "ok"
                          ? "normal"
                          : site.status === "unknown"
                          ? "unknown"
                          : "error"
                      }`}
                    >
                      <div className="icon" />
                      <span className="tip">
                        {site.status === "ok"
                          ? translations.normalAccess // 正常访问
                          : site.status === "unknown"
                          ? translations.unknownStatus // 状态未知
                                 // 无法访问
                          : translations.cannotAccess}
                      </span>
                    </div>
                  </div>
                  <div
                    className="timeline"
                    onClick={() => {
                      showSiteDetails(site);
                    }}
                  >
                    {site.daily.map((data, index) => {
                      const { uptime, down, date } = data;
                      const time = date.format("YYYY-MM-DD");
                      let status = null;
                      let tooltipText = null;
                      if (uptime >= 100) {
                        status = "normal";
                        tooltipText = `Uptime ${formatNumber(uptime)}%`;
                      } else if (uptime <= 0 && down.times === 0) {
                        status = "none";
                        tooltipText = translations.noData; // 无数据
                      } else {
                        status = "error";
                        tooltipText = `Failures ${down.times}, Total ${formatDuration(
                          down.duration
                        )}, Uptime ${formatNumber(uptime)}%`;
                      }
                      return (
                        <Tooltip
                          key={index}
                          title={
                            <div className="status-tooltip">
                              <div className="time">{time}</div>
                              <div className="text">{tooltipText}</div>
                            </div>
                          }
                          destroyTooltipOnHide
                        >
                          <div className={`line ${status}`} />
                        </Tooltip>
                      );
                    })}
                  </div>
                  <div className="summary">
                    <div className="now">{translations.today}</div> {/* 今天 */}
                    <div className="note">
                      {site.total.times
                        ? translations.recentFailure(
                            days,
                            site.total.times,
                            formatDuration(site.total.duration),
                            site.average
                          ) // 最近 {days} 天内故障 {times} 次，累计 {duration}，平均可用率 {average}%
                        : translations.recentUptime(days, site.average)} {/* 最近 {days} 天内可用率 {average}% */}
                    </div>
                    <div className="day">
                      {site.daily[site.daily.length - 1].date.format(
                        "YYYY-MM-DD"
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {/* 站点详情 */}
              <Modal
                title={siteDetailsData?.name}
                open={siteDetailsShow}
                footer={null}
                onOk={closeSiteDetails}
                onCancel={closeSiteDetails}
                bodyStyle={{ marginTop: "20px" }}
              >
                <SiteCharts siteDetails={siteDetailsData} />
              </Modal>
            </div>
          ) : (
            <div className="loading" />
          )
        ) : (
          <Result
            status="error"
            title={translations.retryError} // 调用超限或请求错误，请刷新后重试
            extra={
              <Button
                type="primary"
                danger
                onClick={() => {
                  location.reload();
                }}
              >
                {translations.retry} {/* 重试 */}
              </Button>
            }
          />
        )}
      </CSSTransition>
    </SwitchTransition>
  );
};

export default SiteStatus;
